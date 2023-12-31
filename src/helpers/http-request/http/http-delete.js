const axios = require('axios');

const {
  logRequest,
  logError,
  logResponse,
} = require('../log');
const { ServerError } = require('../../errors');

const requestDelete = async (params) => {
  const {
    url,
    headers = {},
    reqParams = {},
  } = params;

  let apiResult;
  let apiResponse = null;
  let apiError = null;

  const reqConfig = {
    url,
    method: 'DELETE',
    headers: {
      ...headers,
    },
    data: {
      ...reqParams,
    },
  };

  const finalUrl = await axios.getUri(reqConfig);

  try {
    return await axios(reqConfig).then((response) => {
      if ([200, 202, 204].includes(response.status) === false) {
        const errorObj = {
          message: `Request Failed, Invalid HTTP Status code ${response.status}`,
          data: response,
        };
        throw new ServerError(response.status, errorObj);
      }
      logRequest({
        ...reqConfig,
        ...params,
        url: finalUrl,
      });
      apiResponse = response.data;
      logResponse(params, apiResponse);

      apiResult = {
        status: response.status,
        response: apiResponse,
        error: apiError,
      };
      return apiResult;
    }).catch((error) => {
      apiError = new Error(error.message);
      let errorMessage = error.message;
      const { response, data } = error;

      if (response) {
        apiResponse = response;
        errorMessage = (response?.message) ? response?.message : errorMessage;
      }

      if (response?.data) {
        apiResponse = response?.data;
        errorMessage = (apiResponse?.message) ? apiResponse?.message : errorMessage;
      }

      if (data?.data) {
        apiResponse = data?.data;
        errorMessage = (data?.message) ? data?.message : errorMessage;
      }

      apiResult = {
        status: response?.status ?? 0,
        response: apiResponse,
        error: new Error(errorMessage),
      };

      logRequest({
        ...reqConfig,
        ...params,
        url: finalUrl,
      });
      logError(params, errorMessage);

      return apiResult;
    });
  } catch (error) {
    apiError = new Error(error.message);
    apiResult = {
      status: 400,
      response: apiResponse,
      error: apiError,
    };

    logRequest({
      ...reqConfig,
      ...params,
      url: finalUrl,
    });
    logError(params, error.message);

    return apiResult;
  }
};

module.exports = {
  requestDelete,
};
