import { useState } from 'react';
import IntakeForm from './components/IntakeForm';
import TerminalView from './components/TerminalView';

function App() {
  const [isBuilding, setIsBuilding] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);
  const [businessData, setBusinessData] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [stage, setStage] = useState<'idle' | 'design' | 'execute' | 'done'>('idle');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleStartBuilding = async (data: any) => {
    console.log("Business Data:", data);
    setBusinessData(data);
    setIsBuilding(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      console.log("Orchestrator Response:", result);
      
      const currentPlan = result.plan?.sections || result.plan;
      setPlan(currentPlan);
      setStage('design');
      
      // Update terminal with the actual plan received from Gemini
      setPendingCommand(`Orchestrator Plan: ${JSON.stringify(currentPlan)}\n\nDo you want to allow Design Agent to proceed with code generation?`);
    } catch(error) {
      console.error("Failed to call backend:", error);
      alert("Failed to connect to backend server.");
      setIsBuilding(false);
    }
  };

  const handleApprove = async () => {
    if (stage === 'design') {
      setStage('idle');
      setPendingCommand("design-agent@ai:~/project$ writing React components...\nPlease wait (Gemini is thinking, this may take up to 20-30 seconds)...");
      
      try {
        const response = await fetch('http://localhost:5000/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...businessData, plan })
        });
        
        const result = await response.json();
        console.log("Design Agent Response:", result);
        
        if(result.status === 'success') {
            setGeneratedCode(result.code);
            setStage('execute');
            setPendingCommand(`[SUCCESS] Design Agent generated the code!\nCode Length: ${result.code.length} characters.\n\nNext step: Allow Execution Agent to setup Vite project and save files to disk?`);
        } else {
            setPendingCommand(`[ERROR] Design Agent failed to generate code.`);
        }
        
      } catch(error) {
        console.error("Failed to call generation API:", error);
        setPendingCommand(`Error connecting to Design Agent.`);
      }
    } else if (stage === 'execute') {
      setStage('idle');
      setPendingCommand("execution-agent@ai:~/project$ setting up Vite project and saving files...\nPlease wait...");
      
      try {
        const response = await fetch('http://localhost:5000/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: generatedCode })
        });
        
        const result = await response.json();
        
        if(result.status === 'success') {
            setStage('done');
            setPendingCommand(`[SUCCESS] Workspace setup complete!\nPath: generated_workspace/frontend\n\nAb aap backend se bahar aakar generated folder mein jaein:\ncd generated_workspace/frontend\nnpm install\nnpm run dev`);
        } else {
            setPendingCommand(`[ERROR] Execution Agent failed to save files.`);
        }
      } catch(error) {
        console.error("Failed to call execution API:", error);
        setPendingCommand(`Error connecting to Execution Agent.`);
      }
    }
  };

  const handleReject = () => {
    setPendingCommand(null);
    alert("Execution stopped by user.");
    setIsBuilding(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4 shadow-md">
        <div className="container mx-auto flex items-center gap-3">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            AI Website Builder Agent
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-6 flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Intake or Live Preview */}
        <div className="flex-1 flex flex-col">
          {!isBuilding ? (
            <div className="flex-1 flex items-center justify-center">
              <IntakeForm onSubmit={handleStartBuilding} />
            </div>
          ) : (
            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden shadow-xl">
              <div className="bg-slate-900 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                <span className="text-sm text-slate-400 font-medium">Live Preview</span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                  Building...
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center text-slate-500 flex-col gap-4">
                <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                <p>Waiting for agents to generate code...</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Terminal / Execution Agent */}
        <div className="w-full lg:w-[400px] xl:w-[500px]">
          <TerminalView 
            pendingCommand={pendingCommand} 
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>

      </main>
    </div>
  );
}

export default App;
