import { Link } from 'wouter';
import { Dato } from '@/components/LegalPage';
import { LEGAL, PLACEHOLDER_RE } from '@/config/legal';
import { SITE } from '@/config/site';

const R = LEGAL.responsable;

/** Ficha del Responsable del Tratamiento (datos de src/config/legal.ts). */
export function FichaResponsable() {
  return (
    <ul>
      <li><strong>Responsable:</strong> <Dato>{R.nombre}</Dato>, identificado con <Dato>{R.documento}</Dato>, quien desarrolla {SITE.name} bajo el nombre comercial {SITE.author.name}.</li>
      <li><strong>Domicilio:</strong> <Dato>{R.ciudad}</Dato>, Colombia.</li>
      <li><strong>Dirección:</strong> <Dato>{R.direccion}</Dato>.</li>
      <li><strong>Correo electrónico:</strong> <Correo />.</li>
      <li><strong>Teléfono:</strong> <Telefono />.</li>
      <li><strong>Sitio web:</strong> {SITE.url.replace('https://', '')}.</li>
    </ul>
  );
}

export function Correo() {
  if (PLACEHOLDER_RE.test(R.correo)) return <Dato>{R.correo}</Dato>;
  return <a href={`mailto:${R.correo}`}>{R.correo}</a>;
}

export function Telefono() {
  if (PLACEHOLDER_RE.test(R.telefono)) return <Dato>{R.telefono}</Dato>;
  return <a href={`tel:+57${R.telefono.replace(/\D/g, '')}`}>{R.telefono}</a>;
}

export const LinkTratamiento = () => <Link href="/tratamiento-de-datos">Política de Tratamiento de Datos Personales</Link>;
export const LinkPrivacidad = () => <Link href="/politica-de-privacidad">Política de privacidad</Link>;
export const LinkCookies = () => <Link href="/cookies">Política de cookies</Link>;
export const LinkTerminos = () => <Link href="/terminos">Términos y condiciones</Link>;
export const LinkSIC = () => (
  <a href="https://www.sic.gov.co/" target="_blank" rel="noopener noreferrer">Superintendencia de Industria y Comercio (SIC)</a>
);

/** Encargados y terceros previstos (mostrados en privacidad, tratamiento y cookies). */
export const TERCEROS = [
  { nombre: 'Cloudflare, Inc.', rol: 'Encargado', pais: 'Estados Unidos (red global)', para: 'Alojamiento y entrega del sitio, seguridad y protección contra ataques. Puede tratar datos técnicos como la dirección IP y el navegador.' },
  { nombre: 'Supabase, Inc.', rol: 'Encargado (cuando existan cuentas)', pais: 'Estados Unidos u otra región de servidores elegida', para: 'Base de datos y autenticación de las cuentas de usuario y del progreso sincronizado.' },
  { nombre: 'Google LLC – Google Analytics', rol: 'Encargado (solo si aceptas cookies analíticas)', pais: 'Estados Unidos', para: 'Estadísticas agregadas de uso del sitio.' },
  { nombre: 'Google LLC – Google AdSense', rol: 'Tercero (solo si aceptas cookies de publicidad)', pais: 'Estados Unidos', para: 'Mostrar anuncios y medir su rendimiento; puede usar cookies propias según sus políticas.' },
];

export function TablaTerceros() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border border-border rounded-lg">
        <thead className="bg-muted/60 text-left">
          <tr>
            <th scope="col" className="p-2">Proveedor</th>
            <th scope="col" className="p-2">Rol</th>
            <th scope="col" className="p-2">Ubicación de los datos</th>
            <th scope="col" className="p-2">Para qué</th>
          </tr>
        </thead>
        <tbody>
          {TERCEROS.map(t => (
            <tr key={t.nombre} className="border-t border-border align-top">
              <td className="p-2 font-semibold">{t.nombre}</td>
              <td className="p-2">{t.rol}</td>
              <td className="p-2">{t.pais}</td>
              <td className="p-2">{t.para}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
