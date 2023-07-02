import { useState } from 'react'
import { Toaster } from 'react-hot-toast';
import ExtractionPage from './extraction_page'
import { config } from './config';
import './app.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <div className="inline-flex items-center mb-8"><img src="/osc-logo-color.png" className="w-9 h-9 mr-5"/><span className=" border-l border-slate-300 pl-5 text-2xl text-slate-600">Data Extractor</span></div>
      <ExtractionPage/>
      <Toaster />
      <div>Endpoint base: {config.endpoint_base}</div>
      <div>Environment variable {import.meta.env.VITE_ENDPOINT_BASE}</div>
    </div>
  )
}

export default App
