// components/TextInput.js
export default function TextInput({ label, name, value, error, ...props }:any) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block font-medium text-gray-700">{label}</label>
      <input
        id={name}
        name={name}
        value={value}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className="w-full p-3 border rounded-lg shadow-sm focus:ring focus:ring-indigo-200"
        {...props}
      />
      {error && <p id={`${name}-error`} className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
