ALTER TABLE haveyoursay.slt_tbl ADD COLUMN email_address VARCHAR;

CREATE OR REPLACE VIEW haveyoursay.slt_vw AS
 SELECT s.id,
    s.name,
    s.color,
    s.img_src,
    s.blurb,
    s.startdate,
    s.enddate,
    s.email_address
   FROM haveyoursay.slt_tbl s;


