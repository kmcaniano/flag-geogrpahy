import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

export default function Flag(props) {

  if (props.countryCode !== '') {
    return <Container>
      <Box component="img" sx={{
        width: "200px", height: "100px", display: "block", margin: "0 auto"
      }} src={'./flags/' + props.countryCode + '.png'} /></Container>
  }
}