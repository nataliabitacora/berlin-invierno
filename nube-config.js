// Conexión con Supabase (la base de datos en la nube).
// Los dos valores salen de Supabase → Project Settings → API.
// La clave "anon" / "publishable" es pública a propósito: lo que protege los datos
// son las reglas de seguridad de supabase/esquema.sql (cada persona solo ve lo suyo).
// Si se dejan vacíos, la web funciona como antes: todo se guarda solo en este navegador.
const NUBE_CONFIG = {
  url: "",
  clave: ""
};
