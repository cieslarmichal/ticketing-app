import axios from 'axios';
import { useState } from 'react';

export const useRequest = ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async (properties = {}) => {
    try {
      setErrors(null);
      const response = await axios[method](url, { ...body, ...props });
      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (error) {
      setErrors(
        <div className="alert alert-danger">
          <ul className="my-0">
            {error.response.data.errors.map((error) => (
              <li key={error.message}>{error.message}</li>
            ))}
          </ul>
        </div>,
      );
    }
  };

  return { doRequest, errors };
};
