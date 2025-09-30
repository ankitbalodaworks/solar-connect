import { WhatsAppStatus } from '../WhatsAppStatus';

export default function WhatsAppStatusExample() {
  return (
    <div className="p-4 space-y-4">
      <WhatsAppStatus status="connected" />
      <WhatsAppStatus status="disconnected" />
      <WhatsAppStatus status="connecting" />
    </div>
  );
}
