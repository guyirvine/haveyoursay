CREATE TABLE haveyoursay.session_tbl (
  session_key VARCHAR NOT NULL,
  createdon TIMESTAMP NOT NULL DEFAULT NOW(),
  open BOOLEAN DEFAULT TRUE,
  ip_address VARCHAR );

CREATE VIEW haveyoursay.opensessions_vw AS
  SELECT session_key, ip_address
  FROM haveyoursay.session_tbl
  WHERE open = true
  AND NOW()::date - createdon::date < 2;

CREATE TABLE haveyoursay.password_tbl (
  pswhash VARCHAR NOT NULL );

INSERT INTO haveyoursay.password_tbl(pswhash) VALUES ( 'Update Me' );

UPDATE haveyoursay.password_tbl SET pswhash = crypt('new password', gen_salt('md5'));

SELECT pswhash = crypt('entered password', pswhash) FROM haveyoursay.password_tbl;
SELECT pswhash = crypt('new password', pswhash) FROM haveyoursay.password_tbl;
