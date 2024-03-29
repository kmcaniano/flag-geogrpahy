import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import Box from '@mui/material/Box';
import Flag from "./Flag";

export default function SidePanel(props) {
    const successPanel = Object.keys(props.correctGuesses).map((countryCode) =>
        <ListItem key={countryCode}><img src={'./flags/' + countryCode.toLowerCase() + '.png'} width="30px" /> &nbsp; {props.correctGuesses[countryCode]["name"]}</ListItem>
    );

    const skippedPanel = Object.keys(props.skipped).map((countryCode) =>
        <ListItem key={countryCode}><img src={'./flags/' + countryCode.toLowerCase() + '.png'} width="30px" /> &nbsp; {props.skipped[countryCode]["name"]}</ListItem>
    );


    return <Box>
        <Flag countryCode={props.countryCode} />
        <List subheader={
            <ListSubheader component="div" id="nested-list-subheader">
                Correct Guesses
            </ListSubheader>}>{successPanel}</List>
        <List subheader={
            <ListSubheader component="div" id="nested-list-subheader">
                Skipped
            </ListSubheader>}>{skippedPanel}</List>
    </Box>;

}