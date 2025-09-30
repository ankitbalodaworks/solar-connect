import { CampaignForm } from '../CampaignForm';

export default function CampaignFormExample() {
  return (
    <div className="p-4 max-w-2xl">
      <CampaignForm 
        totalCustomers={156}
        onSubmit={(data) => console.log('Campaign data:', data)}
      />
    </div>
  );
}
