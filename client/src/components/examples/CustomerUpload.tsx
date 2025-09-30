import { CustomerUpload } from '../CustomerUpload';

export default function CustomerUploadExample() {
  return (
    <div className="p-4 max-w-2xl">
      <CustomerUpload onUpload={(data) => console.log('Uploaded:', data)} />
    </div>
  );
}
