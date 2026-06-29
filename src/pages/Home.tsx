import Button from '../components/ui/Button';

export default function Home() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Welcome to your App</h2>
      <p className="text-gray-600">
        This project has been structured for scalability and maintainability. 
        Start building your features!
      </p>
      <Button onClick={() => alert('Clicked!')}>Get Started</Button>
    </div>
  );
}
