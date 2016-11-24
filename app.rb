require 'sinatra'
require 'sinatra/cookies'
require 'json'
require 'fluiddb2'
require 'uuidtools'

before do
  @db = FluidDb2.db(ENV['DB'])
end

after do
  @db.close
end

get '/' do
  redirect '/index.htm'
end

get '/card' do
  sql = 'SELECT ca.id, ca.color, ca.question, ca.why, ca.lookingintoit,
                ca.whatwedid, ca.likes, ca.createdon, ca.updated_on, ca.slt_name
          FROM haveyoursay.card_vw ca
          ORDER BY ca.updated_on, ca.createdon DESC'
  @db.query_for_resultset(sql).to_json
end

get '/card/:id' do
  sql = 'SELECT ca.id, ca.color, ca.question, ca.why, ca.lookingintoit,
                ca.whatwedid, ca.likes, ca.createdon, ca.slt_name
          FROM haveyoursay.card_vw ca
          WHERE ca.id = ?'
  @db.query_for_array(sql, [params[:id]]).to_json
end

get '/comment' do
  sql = 'SELECT co.id, co.card_id, co.description, co.createdon
          FROM haveyoursay.comment_vw co
          ORDER BY co.createdon DESC'
  @db.query_for_resultset(sql).to_json
end

get '/card/:id/comments' do
  sql = 'SELECT co.id, co.card_id, co.description, co.createdon
          FROM haveyoursay.comment_vw co
          WHERE co.card_id = ?
          ORDER BY co.createdon DESC'
  @db.query_for_resultset(sql, [params[:id]]).to_json
end

get '/slt' do
  sql = 'SELECT s.id, s.name, s.email_address, s.color, s.img_src, s.blurb,
                s.startdate, s.enddate
          FROM haveyoursay.slt_vw s
          ORDER BY s.startdate'
  @db.query_for_resultset(sql).to_json
end

post '/card/:id/comment' do
  sql = 'INSERT INTO haveyoursay.comment_tbl(card_id, description )
           VALUES (?, ?)'
  data = JSON.parse request.body.read
  payload = [params[:id], data['description']]
  @db.execute(sql, payload)
end

put '/card/:id' do
  sql = 'UPDATE haveyoursay.card_tbl
         SET updated_on = NOW(),
             question = ?,
             why = ?,
             lookingintoit = ?,
             whatwedid = ?
         WHERE id = ?'

  data = JSON.parse request.body.read
  payload = [data['question'],
             data['why'],
             data['lookingintoit'],
             data['whatwedid'],
             params[:id]]
  @db.execute(sql, payload)
end

put '/card/response/:id' do
  sql = 'SELECT count(*) FROM haveyoursay.opensessions_vw
         WHERE session_key = ? AND ip_address = ?'
  values = [request.cookies['session_key'], request.ip]
  return 401 unless @db.query_for_value(sql, values).to_i > 0

  sql = 'UPDATE haveyoursay.card_tbl
         SET updated_on = NOW(),
             lookingintoit = ?,
             whatwedid = ?
         WHERE id = ?'

  data = JSON.parse request.body.read
  payload = [data['lookingintoit'],
             data['whatwedid'],
             params[:id]]
  @db.execute(sql, payload)
end

put '/card/:id/likes' do
  sql = 'UPDATE haveyoursay.card_tbl
         SET updated_on = NOW(),
             likes = ?
         WHERE id = ?'

  data = JSON.parse request.body.read
  payload = [data['likes'].to_i,
             params[:id]]
  @db.execute(sql, payload)
end

post '/card' do
  sql = 'INSERT INTO haveyoursay.card_tbl(question, why, slt_id)
         VALUES (?,?,?)'

  data = JSON.parse request.body.read
  payload = [data['question'],
             data['why'],
             data['slt_id']]
  @db.execute(sql, payload)

  @db.query_for_value("SELECT CURRVAL('haveyoursay.card_seq')")
end

post '/session' do
  #  data = JSON.parse request.body.read

  sql = 'SELECT count(*)
         FROM haveyoursay.password_tbl
         WHERE pswhash = crypt(?, pswhash);'
  return 401 unless @db.query_for_value(sql, [params['password']]).to_i > 0

  session_key = UUIDTools::UUID.random_create.to_s
  sql = 'INSERT INTO haveyoursay.session_tbl(session_key, ip_address)
         VALUES (?, ?);'
  @db.execute(sql, [session_key, request.ip])

  # response.set_cookie('session_key', value: session_key)
  # cookies[:session_key] = session_key

  puts Hash['session_key', session_key].to_json
  Hash['session_key', session_key].to_json
end

post '/session/close' do
  sql = 'UPDATE haveyoursay.session_tbl
         SET open = false
         WHERE session_key = ?
         AND ip_address = ?
         AND open = true'
  values = [request.cookies['session_key'], request.ip]
  @db.execute(sql, values)
end
