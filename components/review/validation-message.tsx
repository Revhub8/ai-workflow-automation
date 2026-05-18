type ValidationMessageProps = {
  message?: string;
  id?: string;
};

export function ValidationMessage({ message, id }: ValidationMessageProps) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 text-xs font-medium text-red-600"
    >
      {message}
    </p>
  );
}
