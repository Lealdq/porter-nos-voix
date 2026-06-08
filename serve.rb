require 'socket'
require 'open3'
require 'uri'
require 'json'
require 'fileutils'
require 'time'
require 'net/http'

SITE   = '/Users/lealeducq/Library/CloudStorage/OneDrive-HESSO/CV3/memoire/pratique/site-pancartes'
IMAGES = '/Users/lealeducq/Library/CloudStorage/OneDrive-HESSO/CV3/memoire/pratique/images'
DATA   = SITE + '/data'

# ── Configuration e-mail (Web3Forms) ────────────────────────────────────────
# 1. Va sur https://web3forms.com
# 2. Entre lea94120@icloud.com  →  tu reçois ta clé par mail
# 3. Colle-la ici :
WEB3FORMS_KEY = "VOTRE_CLE_WEB3FORMS"
MAIL_DESTINATAIRE = "lea94120@icloud.com"

MIME = {
  'png'  => 'image/png',
  'jpg'  => 'image/jpeg',
  'jpeg' => 'image/jpeg',
  'webp' => 'image/webp',
  'gif'  => 'image/gif',
  'html' => 'text/html; charset=utf-8',
  'css'  => 'text/css',
  'js'   => 'application/javascript',
  'json' => 'application/json',
  'otf'  => 'font/otf',
  'ttf'  => 'font/ttf',
}

# ── Lecture du corps de la requête ──────────────────────────────────────────
def read_body(socket, headers)
  length = headers['content-length']&.to_i
  return ''.b unless length && length > 0
  socket.read(length)
end

# ── Extraction du boundary multipart ────────────────────────────────────────
def extract_boundary(content_type)
  m = content_type&.match(/boundary=([^\s;]+)/)
  m ? m[1].gsub(/\A"(.*)"\z/, '\1') : nil
end

# ── Parseur multipart/form-data ─────────────────────────────────────────────
def parse_multipart(body, boundary)
  parts = {}
  sep   = ("--" + boundary).b
  crlf  = "\r\n".b

  pos = 0
  loop do
    idx = body.index(sep, pos)
    break unless idx

    after_sep = idx + sep.bytesize
    break if body[after_sep, 2] == "--".b   # délimiteur de fin

    after_sep += 2   # sauter \r\n après le boundary

    next_sep_pos = body.index(crlf + sep, after_sep)
    break unless next_sep_pos

    part = body[after_sep, next_sep_pos - after_sep]
    hdr_end = part.index(crlf + crlf)
    pos = next_sep_pos + 2
    next unless hdr_end

    headers_str = part[0, hdr_end].force_encoding('UTF-8') rescue ''
    content     = part[hdr_end + 4..-1] || ''.b

    name = headers_str[/name="([^"]+)"/i, 1]
    next unless name

    filename = headers_str[/filename="([^"]+)"/i, 1]
    ct       = headers_str[/Content-Type:\s*(\S+)/i, 1]

    if filename && !filename.empty?
      parts[name] = { filename: filename, content_type: ct, data: content }
    else
      parts[name] = content.force_encoding('UTF-8').strip rescue ''
    end
  end

  parts
end

# ── Traitement d'une soumission ──────────────────────────────────────────────
def handle_soumission(body, headers)
  ct       = headers['content-type'] || ''
  boundary = extract_boundary(ct)
  return { success: false, message: 'boundary multipart manquant' } unless boundary

  parts = parse_multipart(body, boundary)

  # Identifiant unique
  timestamp = Time.now.strftime('%Y%m%d-%H%M%S-%L')
  id = "soumission-#{timestamp}"

  # Sauvegarde de la photo
  photo_part = parts['photo']
  photo_path = nil
  if photo_part.is_a?(Hash) && photo_part[:data] && !photo_part[:data].empty?
    photos_dir = File.join(DATA, 'soumissions', 'photos')
    FileUtils.mkdir_p(photos_dir)
    ext      = File.extname(photo_part[:filename]).downcase
    ext      = '.jpg' if ext.empty?
    filename = "#{id}#{ext}"
    File.open(File.join(photos_dir, filename), 'wb') { |f| f.write(photo_part[:data]) }
    photo_path = "data/soumissions/photos/#{filename}"
  end

  # Enregistrement de la soumission
  submission = {
    id:               id,
    date_soumission:  Time.now.iso8601,
    texte:            parts['texte']       || '',
    ville:            parts['ville']       || '',
    pays:             parts['pays']        || '',
    annee:            parts['annee']       || '',
    langue:           parts['langue']      || 'fr',
    description:      parts['description'] || '',
    themes:           (parts['themes'] || '').split(',').map(&:strip).reject(&:empty?),
    photographe:      parts['photographe'] || 'anonyme',
    photo:            photo_path,
    statut:           'en_attente'
  }

  json_path  = File.join(DATA, 'soumissions.json')
  existing   = File.exist?(json_path) ? JSON.parse(File.read(json_path)) : []
  existing  << submission
  File.write(json_path, JSON.pretty_generate(existing))

  # Notification e-mail via Web3Forms (asynchrone, ne bloque pas la réponse)
  Thread.new { envoyer_email(submission) }

  { success: true, id: id }
rescue => e
  { success: false, message: e.message }
end

# ── Envoi de l'e-mail de notification via Web3Forms ─────────────────────────
def envoyer_email(submission)
  return if WEB3FORMS_KEY == "VOTRE_CLE_WEB3FORMS"

  themes_str = submission[:themes].any? ? submission[:themes].join(', ') : '—'
  corps = <<~TXT
    Nouvelle pancarte soumise sur porter nos voix.

    Texte      : #{submission[:texte]}
    Ville      : #{submission[:ville]}
    Pays       : #{submission[:pays]}
    Année      : #{submission[:annee]}
    Langue     : #{submission[:langue]}
    Thèmes     : #{themes_str}
    Contexte   : #{submission[:description].empty? ? '—' : submission[:description]}
    Photographe: #{submission[:photographe]}
    Photo      : #{submission[:photo] || '—'}
    ID         : #{submission[:id]}

    → Ouvrez data/soumissions.json pour examiner cette soumission.
  TXT

  payload = {
    access_key:  WEB3FORMS_KEY,
    subject:     "Nouvelle pancarte — porter nos voix",
    from_name:   "Porter nos voix",
    email:       MAIL_DESTINATAIRE,
    message:     corps,
    botcheck:    ""
  }

  uri  = URI("https://api.web3forms.com/submit")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl     = true
  http.read_timeout = 10
  req  = Net::HTTP::Post.new(uri.path, 'Content-Type' => 'application/json')
  req.body = payload.to_json
  http.request(req)
rescue => e
  warn "[web3forms] échec de l'envoi : #{e.message}"
end

# ── Gestionnaire principal ───────────────────────────────────────────────────
def serve(socket)
  request = socket.gets
  return unless request
  method, path, _ = request.split(' ')

  # Lecture des headers
  headers = {}
  while (line = socket.gets)
    break if line.strip.empty?
    key, val = line.split(':', 2)
    headers[key.strip.downcase] = val.strip if key && val
  end

  # Nettoyage du chemin
  path = path.split('?').first
  path = URI.decode_www_form_component(path) rescue path

  # ── Preflight CORS ──
  if method == 'OPTIONS'
    socket.print "HTTP/1.1 204 No Content\r\n"
    socket.print "Access-Control-Allow-Origin: *\r\n"
    socket.print "Access-Control-Allow-Methods: POST, GET, OPTIONS\r\n"
    socket.print "Access-Control-Allow-Headers: Content-Type\r\n"
    socket.print "Connection: close\r\n\r\n"
    return
  end

  # ── POST /api/soumettre ──
  if method == 'POST' && path == '/api/soumettre'
    body   = read_body(socket, headers)
    result = handle_soumission(body, headers)
    json   = result.to_json
    socket.print "HTTP/1.1 200 OK\r\n"
    socket.print "Content-Type: application/json; charset=utf-8\r\n"
    socket.print "Content-Length: #{json.bytesize}\r\n"
    socket.print "Access-Control-Allow-Origin: *\r\n"
    socket.print "Connection: close\r\n\r\n"
    socket.print json
    return
  end

  # ── GET statique ────────────────────────────────────────────────────────────
  if path.start_with?('/images/')
    rel  = path.sub('/images', '')
    file = IMAGES + rel
  else
    path = '/index.html' if path == '/'
    file = SITE + path
  end

  body, _err, status = Open3.capture3('cat', file)

  if status.success? && body.length > 0
    ext  = file.split('.').last.to_s.downcase
    mime = MIME[ext] || 'application/octet-stream'
    socket.print "HTTP/1.1 200 OK\r\n"
    socket.print "Content-Type: #{mime}\r\n"
    socket.print "Content-Length: #{body.bytesize}\r\n"
    socket.print "Access-Control-Allow-Origin: *\r\n"
    socket.print "Cache-Control: no-cache\r\n"
    socket.print "Connection: close\r\n"
    socket.print "\r\n"
    socket.write body
  else
    socket.print "HTTP/1.1 404 Not Found\r\nContent-Length: 9\r\nConnection: close\r\n\r\nNot found"
  end
rescue => e
  socket.print "HTTP/1.1 500 Error\r\nContent-Length: #{e.message.length}\r\nConnection: close\r\n\r\n#{e.message}" rescue nil
ensure
  socket.close
end

server = TCPServer.new('127.0.0.1', 8787)
puts "Serveur sur http://localhost:8787"
puts "Soumissions sauvegardées dans data/soumissions.json"
if WEB3FORMS_KEY == "VOTRE_CLE_WEB3FORMS"
  puts "⚠  Notifications mail désactivées — ajoutez votre clé Web3Forms dans serve.rb"
else
  puts "✉  Notifications mail → #{MAIL_DESTINATAIRE}"
end

loop do
  Thread.new(server.accept) { |s| serve(s) }
end
