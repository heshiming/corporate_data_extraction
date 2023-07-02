import { useState, useCallback } from 'react';
import UploadStep from './upload_step';
import ExtractStep from './extract_step';


function Steps({ step }) {
  var steps = [
    {name: 'Upload PDFs'},
    {name: 'Extract and Download'},
  ];

  return (
    <ul className="steps">
      { steps.map((step_, idx) => (
        <li key={idx} className={`step after:font-bold ${step >= idx?'step-primary':''}`}>{step_.name}</li>
      ))}
    </ul>
  )
}


function StepContent({ step, setStep }) {
  switch (step) {
  case 0:
    return (<UploadStep setStep={setStep}/>);
  case 1:
    return (<ExtractStep setStep={setStep}/>);
  }
}


export default function ExtractionPage() {
  const [step, setStep] = useState(0);

  return (
    <div>
      <Steps step={step}/>
      <StepContent step={step} setStep={setStep}/>
    </div>
  )
}
