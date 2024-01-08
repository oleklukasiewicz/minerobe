export const load = async (params) => {
  return {
    path: {
      unlink: params.params.unlink,
    },
  };
};
