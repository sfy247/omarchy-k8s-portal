import { makeStyles } from '@material-ui/core';
import { LogoIcon } from './LogoIcon';
import { useBrand } from './brand';

const useStyles = makeStyles({
  root: { display: 'flex', alignItems: 'center', gap: 10 },
  text: { display: 'flex', flexDirection: 'column', lineHeight: 1.05 },
  name: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: 900,
    fontStyle: 'italic',
    letterSpacing: 0.3,
    whiteSpace: 'nowrap',
  },
  number: { color: '#e8b45f' },
  tagline: {
    color: '#c9c9cc',
    fontSize: 9.5,
    fontWeight: 600,
    letterSpacing: 2.6,
    whiteSpace: 'nowrap',
    marginTop: 3,
  },
});

export const LogoFull = () => {
  const classes = useStyles();
  const { name, word, number } = useBrand();
  return (
    <span className={classes.root}>
      <LogoIcon size={40} />
      <span className={classes.text}>
        <span className={classes.name}>
          {name ? (
            <>
              {word}
              <span className={classes.number}>{number}</span>
            </>
          ) : (
            'Developer Portal'
          )}
        </span>
        {name && <span className={classes.tagline}>DEVELOPER PORTAL</span>}
      </span>
    </span>
  );
};
