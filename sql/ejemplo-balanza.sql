CREATE OR REPLACE FUNCTION sortCuenta(cuenta varchar) RETURNS varchar
AS $$
DECLARE
    part        varchar(1000);
    partCeros   varchar(1000);
    lista       varchar[];
    resultado   varchar(1000);
    delimitador varchar(1);
BEGIN
   delimitador := '.';
   IF ( cuenta ~* '-') THEN
		delimitador := '-';
   END IF;
   FOREACH part IN ARRAY string_to_array(cuenta, delimitador) LOOP
     SELECT TO_CHAR(part::INTEGER, 'fm000000') INTO partCeros; 
	   lista := lista || partCeros;
	   -- raise notice '%', partCeros;
   END LOOP; 
   resultado := array_to_string(lista,'.');

   RETURN resultado;
END;
$$ language plpgsql;

-- SELECT sortCuenta('1.2.3');

DROP TABLE IF EXISTS cuenta cascade;
CREATE TABLE IF NOT EXISTS cuenta(
	cuenta_id      varchar(100) PRIMARY KEY, 
	rama_id        varchar(100), 
	cuenta_nombre  text);

DROP TABLE IF EXISTS poliza cascade;
CREATE TABLE IF NOT EXISTS poliza(
	poliza_id     int PRIMARY KEY, 
	cuenta_id     varchar(100)  REFERENCES cuenta(cuenta_id), 
	importe       numeric);

CREATE OR REPLACE VIEW reporte AS (
WITH recursive cte_cuenta AS (
    SELECT a.cuenta_id AS cuenta_id,
           a.cuenta_id AS poliza_cuenta_id
      FROM cuenta AS a
     WHERE NOT EXISTS (SELECT FROM cuenta AS tt WHERE tt.rama_id = a.cuenta_id)
    UNION ALL
    SELECT a.rama_id AS cuenta_id,
          c.poliza_cuenta_id
     FROM cte_cuenta AS c
    INNER JOIN cuenta AS a on a.cuenta_id = c.cuenta_id
    WHERE a.rama_id is not null
), cte_saldo AS (
  SELECT a.cuenta_id,
         sum(b.importe) AS saldo
    FROM cte_cuenta AS a
   INNER JOIN poliza AS b on b.cuenta_id = a.poliza_cuenta_id
   GROUP BY a.cuenta_id
)   
  SELECT a.cuenta_id,
    	 a.cuenta_nombre,
         b.saldo
    FROM cte_saldo AS b
   INNER JOIN cuenta AS a on a.cuenta_id = b.cuenta_id
   ORDER BY sortCuenta(a.cuenta_id) asc
);
	

-- datos
INSERT INTO cuenta (cuenta_id, rama_id, cuenta_nombre) VALUES
('1', null, 'Activos'),
('1.1', '1', 'Activo Circlante'),
('1.1.1', '1.1', 'Bancos'),
('1.1.1.1', '1.1.1', 'HSBC'),
('1.1.1.2', '1.1.1', 'Stantander'),
('1.1.1.10', '1.1.1', 'BBVA'),
('2', null, 'Pasivo'),
('2.1', '2', 'Proveedores'),
('2.1.1', '2.1', 'Jose'),
('2.1.2', '2.1', 'Antonio');

INSERT INTO poliza (poliza_id, cuenta_id, importe) VALUES
(1, '1.1.1.1', 10 ),
(2, '1.1.1.2', 18 ),
(3, '1.1.1.10', 30 ),
(4, '2.1.1', 10 ),
(5, '2.1.2', 5 );

-- SELECT * FROM cuenta;
-- SELECT * FROM poliza;
	
SELECT * FROM reporte;