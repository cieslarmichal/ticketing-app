import Router from 'next/router';
import { useRequest } from '../../hooks';
import { useEffect, useState } from 'react';

const GetOrder = ({ order }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const findTimeLeft = () => {
      const expiresAtInMs = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(expiresAtInMs / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: { orderId: order.id },
    onSuccess: () => {
      Router.push('/');
    },
  });

  if (timeLeft < 0) {
    return (
      <div>
        <h4>Time left to pay: {timeLeft} seconds</h4>
      </div>
    );
  }

  return (
    <div>
      <h4>Time left to pay: {timeLeft} seconds</h4>
      {errors}
      <button onClick={doRequest} className="btn btn-primary">
        Purchase
      </button>
    </div>
  );
};

GetOrder.getInitialProps = async (context, client) => {
  const { orderId } = context.query;

  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default GetOrder;
