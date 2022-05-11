import { useState } from 'react';
import { useRequest } from '../../hooks';

const CreateTicket = () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: { title, price },
    onSuccess: (ticket) => {
      console.log(ticket);
      // Router.push('/');
    },
  });

  const onBlur = () => {
    const value = parseFloat(price);

    if (isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(2));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    await doRequest();
  };

  return (
    <div>
      <h1>Create ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="form-control" />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            onBlur={onBlur}
            className="form-control"
          />
        </div>
        {errors}
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default CreateTicket;
