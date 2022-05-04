import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/buildClient';

const AppComponent = ({ Component, pageProps }) => {
  return (
    <div>
      <h1>Hi</h1>
      <Component {...pageProps} />
    </div>
  );
};

AppComponent.getInitialProps = () => {};

export default AppComponent;
