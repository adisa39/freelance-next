/** Loads the per-view CSS that Laravel pushed with @push('style') (extracted verbatim to public/assets/templates/basic/css/pages). */
export default function PageCss({ name }: { name: string }) {
  return <link rel="stylesheet" href={`/assets/templates/basic/css/pages/${name}.css`} precedence="default" />;
}
