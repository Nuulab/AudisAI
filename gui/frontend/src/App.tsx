import logo from "@/assets/logo-blk.svg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Folder, Github, Play, Settings, Terminal } from "lucide-react";
import { useEffect, useState } from 'react';
import {
    GetAuthStatus,
    GetAvailableStates,
    SelectFolder,
    StartScan
} from "../wailsjs/go/main/App";
import { EventsOn } from "../wailsjs/runtime/runtime";

interface State {
  code: string;
  name: string;
}

function App() {
  const [sourceType, setSourceType] = useState<'folder' | 'github' | 'gitlab'>('folder');
  const [source, setSource] = useState('');
  const [states, setStates] = useState<string[]>(['all']);
  const [format, setFormat] = useState('pdf');
  const [minSeverity, setMinSeverity] = useState('low');
  const [output, setOutput] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [authStatus, setAuthStatus] = useState('');
  const [availableStates, setAvailableStates] = useState<State[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    GetAuthStatus().then(setAuthStatus);
    GetAvailableStates().then(states => setAvailableStates(states as unknown as State[]));
    
    EventsOn('scan:output', (line: string) => {
      setOutput(prev => [...prev, line]);
    });
    
    EventsOn('scan:complete', () => {
      setScanning(false);
    });
  }, []);

  const handleSelectFolder = async () => {
    const path = await SelectFolder();
    if (path) setSource(path);
  };

  const handleStartScan = async () => {
    setOutput([]);
    setScanning(true);
    
    try {
      await StartScan({
        source,
        sourceType,
        states,
        format,
        outputDir: '.',
        minSeverity,
        failOnViolation: false,
        token: ''
      });
    } catch (err) {
      setOutput(['Error: ' + String(err)]);
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 dark">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <img src={logo} alt="AudisAI" className="h-12" />
          <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Source Card */}
        <Card>
          <CardHeader>
            <CardTitle>Source</CardTitle>
            <CardDescription>Select a folder or enter a repository URL to scan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                variant={sourceType === 'folder' ? 'default' : 'outline'}
                onClick={() => setSourceType('folder')}
                className="flex-1"
              >
                <Folder className="mr-2 h-4 w-4" /> Local Folder
              </Button>
              <Button 
                variant={sourceType === 'github' ? 'default' : 'outline'}
                onClick={() => setSourceType('github')}
                className="flex-1"
              >
                <Github className="mr-2 h-4 w-4" /> GitHub
              </Button>
              <Button 
                variant={sourceType === 'gitlab' ? 'default' : 'outline'}
                onClick={() => setSourceType('gitlab')}
                className="flex-1"
              >
                🦊 GitLab
              </Button>
            </div>
            
            {sourceType === 'folder' ? (
              <div className="flex gap-2">
                <Input value={source} placeholder="Select a folder..." readOnly className="flex-1" />
                <Button onClick={handleSelectFolder}>Browse</Button>
              </div>
            ) : (
              <Input 
                value={source} 
                onChange={e => setSource(e.target.value)}
                placeholder={`${sourceType}.com/owner/repo`}
              />
            )}
          </CardContent>
        </Card>

        {/* Settings Card */}
        {showSettings && (
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
                  <Select value={format} onChange={e => setFormat(e.target.value)}>
                    <option value="pdf">PDF</option>
                    <option value="markdown">Markdown</option>
                    <option value="json">JSON</option>
                    <option value="sarif">SARIF</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Severity</label>
                  <Select value={minSeverity} onChange={e => setMinSeverity(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">States</label>
                  <Select 
                    value={states[0]} 
                    onChange={e => setStates([e.target.value])}
                  >
                    <option value="all">All Policies</option>
                    {availableStates.map(s => (
                      <option key={s.code} value={s.code}>{s.name}</option>
                    ))}
                  </Select>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Authentication Status</h4>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{authStatus}</pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scan Button */}
        <Button 
          className="w-full h-12 text-lg" 
          onClick={handleStartScan}
          disabled={!source || scanning}
        >
          <Play className="mr-2 h-5 w-5" />
          {scanning ? 'Scanning...' : 'Start Scan'}
        </Button>

        {/* Output Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" /> Output
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-md p-4 min-h-[200px] max-h-[400px] overflow-y-auto font-mono text-sm">
              {output.length === 0 ? (
                <p className="text-muted-foreground">Scan output will appear here...</p>
              ) : (
                output.map((line, i) => <div key={i}>{line}</div>)
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
