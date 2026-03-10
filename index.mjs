export default {
  async fetch(_request, _env, _ctx) {
    return new Response(
      "Bleu.js Quantum-Enhanced AI Platform - Backend Ready",
      {
        headers: {
          "content-type": "text/plain",
          "Access-Control-Allow-Origin": "*", // restrict in production (e.g. your front-end origin)
        },
      },
    );
  },
};
