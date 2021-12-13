import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import styledComponents from 'styled-components';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

const Section = styledComponents.div`
  margin-top: 8em;
`;

const Controlls = styledComponents.div`
  text-align: center;
  margin: 15px 200px;
`;

const H1 = styledComponents.h1`
  text-align: center;
  margin-bottom: 40px;
  font-size: 2em;
`;

const Console = styledComponents.div`
    text-align: left;
    background-color: aliceblue;
    margin: 15px 200px;
    padding: 15px;
    border-radius: 14px;
`;

function getSteps() {
  return ['START', 'STEP 1', 'STEP 2', 'STEP 3', 'STEP 4', 'STEP 5'];
}

const useEventSource = (url) => {
  const [activeStep, setActiveStep] = useState({ step: 0 });
  const [logs, setLogs] = useState();

  const updateLogger = ({ logger }) => {
    const logs = JSON.parse(localStorage.getItem('logger')) || [];
    localStorage.setItem(
      'logger',
      JSON.stringify([{ logger: logger }, ...logs])
    );
  };

  const handlerStart = () => {
    const source = new EventSource(url);

    source.onopen = () => {
      console.log('CONNECTION WITH SERVER IS OPEN');
    };

    source.onmessage = (event) => {
      const newEvent = JSON.parse(event.data);
      if (newEvent.step > 0) {
        console.log(newEvent);
        updateLogger(newEvent);
        setActiveStep(newEvent);
      } else {
        source.close();
        console.log('CONNECTION WITH SERVER WAS CLOSED');
      }
    };
  };

  const handlerClear = () => {
    setLogs(undefined);
    localStorage.setItem('logger', JSON.stringify([]));
  };

  useEffect(() => {
    setLogs(JSON.parse(localStorage.getItem('logger')) || []);
  }, [activeStep]);

  return { handlerStart, activeStep, logs, handlerClear };
};

export default function Home() {
  const classes = useStyles();
  const { activeStep, handlerStart, logs, handlerClear } = useEventSource(
    'http://localhost:4200/stream-random-numbers'
  );
  const steps = getSteps();

  return (
    <Section className={classes.root}>
      <H1>Pipeline with Server Sent Events</H1>
      <Stepper activeStep={activeStep.step} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Controlls>
        {activeStep.step === 0 && (
          <>
            <Button onClick={handlerStart} color="primary" variant="contained">Start Proccess</Button>
          </>
        )}

        {activeStep.step === getSteps().length && (
          <>
            <Alert severity="success">Successfully Concluded!</Alert>
            <br />
            <Button onClick={handlerStart} variant="outlined" color="primary">Reset</Button>
          </>
        )}

        {logs && (
          <Console>
            <div style={{ justifyContent: 'space-between', display: 'flex' }}>
              <strong>CONSOLE:</strong>
              <Button onClick={handlerClear} color="secondary">Clear</Button>
            </div>
            {logs.map((log) => (
              <>
                <p>{log.logger}</p>
                <Divider />
              </>
            ))}
          </Console>
        )}
      </Controlls>
    </Section>
  );
}
