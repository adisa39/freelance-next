import { asset } from '@/lib/template';
/** partials/empty.blade.php (styles live in the template CSS via the inline <style> below) */
export default function Empty({ message }: { message: string }) {
  return (
    <div className="empty-message text-center py-5">
      <span className="d-flex justify-content-center align-items-center empty-slip-message"><img src={asset('templates/basic/images/empty.png')} alt="empty" /><h6 className="text-muted mt-3">{message}</h6></span>
      <style dangerouslySetInnerHTML={{ __html: '.empty-slip-message{display:flex;flex-direction:column;justify-content:center;align-items:center;color:#cfcfcf;font-size:.8754rem;font-family:inherit}.empty-slip-message img{width:75px!important;margin-bottom:.875rem}' }} />
    </div>
  );
}
