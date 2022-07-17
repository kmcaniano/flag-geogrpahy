import MapWrapper from "./MapWrapper";
import Flag from "./Flag";
import React, {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Grid';
import SidePanel from "./SidePanel";


export default function App(props) {

  const [countryCode, setCountryCode] = useState("");
  const [correctGuess, setCorrectGuess] = useState({});
  const [skippedFlags, setSkippedFlags] = useState({});

  const countriesJson = require('./countries.json');


  useEffect(() => getNewCountry(), []);

  function getNewCountry() {
    var countries = Object.keys(countriesJson);
    setCountryCode(countries[Math.floor(Math.random() * countries.length)]);
  }

  function successCountry(successCountryCode) {
    const updatedValue = {};
    updatedValue[successCountryCode] = countriesJson[successCountryCode];
    setCorrectGuess({...correctGuess, ...updatedValue});
    delete countriesJson[successCountryCode];
    getNewCountry();
  }

  function skippedCountry() {
    const updatedValue = {};
    updatedValue[countryCode] = countriesJson[countryCode];
    setSkippedFlags({...skippedFlags, ...updatedValue});
    delete countriesJson[countryCode];
    getNewCountry();
  }

        return <div>
        <AppBar position="relative">
        <Toolbar>
          <Typography variant="h6" color="inherit" noWrap>
            Identify the flags
          </Typography>
        </Toolbar>      
        </AppBar>
        <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
        <Typography
              component="h1"
              variant="h5"
              align="center"
              gutterBottom
            >
              Identify the flag by picking the correct country on the map!
            </Typography></Grid>
            <Grid item xs={12}>

          <Flag countryCode={countryCode} /></Grid>
          <Grid item xs={2}><SidePanel correctGuesses={correctGuess} skipped={skippedFlags}/></Grid>
          <Grid item xs={10}><MapWrapper countryCode={countryCode} reloadCountry={successCountry} skipCountry={skippedCountry}/></Grid>
          </Grid>
          </Box></div>;
}