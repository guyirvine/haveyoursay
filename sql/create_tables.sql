DROP SCHEMA haveyoursay CASCADE;

CREATE SCHEMA haveyoursay;
CREATE SEQUENCE haveyoursay.slt_seq;
CREATE SEQUENCE haveyoursay.card_seq;
CREATE SEQUENCE haveyoursay.comment_seq;

CREATE TABLE haveyoursay.slt_tbl (
  id BIGINT NOT NULL PRIMARY KEY DEFAULT NEXTVAL('haveyoursay.slt_seq'),
  name VARCHAR NOT NULL,
  color VARCHAR NOT NULL,
  img_src VARCHAR NOT NULL DEFAULT 'images/smiley.png',
  blurb VARCHAR NOT NULL DEFAULT '',
  startdate TIMESTAMP NOT NULL,
  enddate TIMESTAMP NOT NULL,
  createdon TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE haveyoursay.card_tbl (
  id BIGINT NOT NULL PRIMARY KEY DEFAULT NEXTVAL('haveyoursay.card_seq'),
  slt_id BIGINT NOT NULL REFERENCES haveyoursay.slt_tbl,
  question VARCHAR NOT NULL,
  why VARCHAR NOT NULL,
  lookingintoit VARCHAR NOT NULL DEFAULT '',
  whatwedid VARCHAR NOT NULL DEFAULT '',
  likes INT NOT NULL DEFAULT 0,
  createdon TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE haveyoursay.comment_tbl (
  id BIGINT NOT NULL PRIMARY KEY DEFAULT NEXTVAL('haveyoursay.comment_seq'),
  card_id BIGINT REFERENCES haveyoursay.card_tbl DEFAULT CURRVAL('haveyoursay.card_seq'),
  description VARCHAR NOT NULL,
  createdon TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE VIEW haveyoursay.slt_vw AS
  SELECT s.id, s.name, s.color, s.img_src, s.blurb, s.startdate, s.enddate
  FROM haveyoursay.slt_tbl s;

CREATE VIEW haveyoursay.card_vw AS
  SELECT ca.id, s.color, ca.question, ca.why, ca.lookingintoit, ca.whatwedid, ca.likes, ca.createdon, s.name AS slt_name
  FROM haveyoursay.card_tbl ca
    INNER JOIN haveyoursay.slt_tbl s ON (ca.slt_id = s.id);

CREATE VIEW haveyoursay.comment_vw AS
  SELECT co.id, co.card_id, co.description, co.createdon
  FROM haveyoursay.comment_tbl co
    INNER JOIN haveyoursay.card_tbl ca ON (co.card_id = ca.id);
