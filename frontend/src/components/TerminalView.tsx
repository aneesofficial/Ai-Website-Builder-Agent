import React from 'react';

export default function TerminalView({ pendingCommand, onApprove, onReject }: any) {
  return (
    <div className="bg-[#0c0c0c] border border-slate-700 rounded-xl overflow-hidden flex flex-col h-full shadow-2xl font-mono text-sm">
      {/* Terminal Header */}
      <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-slate-400 text-xs ml-2">Execution Agent - bash</span>
      </div>

      {/* Terminal Body */}
      <div className="p-4 flex-1 overflow-y-auto text-green-400 space-y-4">
        <div>
          <span className="text-blue-400">orchestrator@ai</span>:<span className="text-purple-400">~/project</span>$ planning complete...
        </div>
        <div>
          <span className="text-blue-400">design-agent@ai</span>:<span className="text-purple-400">~/project</span>$ preparing React components...
        </div>
        
        {pendingCommand && (
          <div className="bg-slate-900/50 p-4 rounded border border-yellow-500/30 mt-4">
            <div className="text-yellow-400 mb-2 font-bold flex items-center gap-2">
              <span>⚠️</span> Permission Required
            </div>
            <p className="text-slate-300 mb-2">The Execution Agent wants to run the following command:</p>
            <div className="bg-black p-3 rounded text-white font-mono mb-4 border border-slate-700">
              {pendingCommand}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onApprove}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold transition-colors"
              >
                Allow (Y)
              </button>
              <button 
                onClick={onReject}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-bold transition-colors"
              >
                Deny (N)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
