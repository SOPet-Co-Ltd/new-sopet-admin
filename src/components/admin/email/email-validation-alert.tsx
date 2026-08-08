import { HiOutlineExclamationCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2';

/**
 * Assertive live region listing save blockers (unknown placeholders, missing
 * content slot, email-safe violations, server errors) plus non-blocking
 * warnings. See UI Spec § EmailValidationAlert.
 */
export function EmailValidationAlert({
  errors = [],
  warnings = [],
}: {
  errors?: string[];
  warnings?: string[];
}) {
  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {errors.length > 0 ? (
        <div
          role="alert"
          className="flex gap-3 rounded-lg border border-danger/20 bg-danger-bg px-4 py-3 text-sm text-danger"
        >
          <HiOutlineExclamationCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">บันทึกไม่สำเร็จ — พบข้อผิดพลาด</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              {errors.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <div
          role="status"
          className="flex gap-3 rounded-lg border border-warning-text/20 bg-warning-bg px-4 py-3 text-sm text-warning-text"
        >
          <HiOutlineExclamationTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">คำเตือน (ไม่บล็อกการบันทึก)</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              {warnings.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
