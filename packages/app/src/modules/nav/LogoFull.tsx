import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: 0.2,
    whiteSpace: 'nowrap',
  },
});

export const LogoFull = () => {
  const classes = useStyles();
  return <span className={classes.title}>Developer Portal</span>;
};
