// reasoner.js — the pluggable reasoning layer ("the Model" in Agent = Model + Harness).
//
// The runtime invokes reasoning as MCP-style tool calls: invoke(tool, input) -> output.
// The DEFAULT reasoner is deterministic (fixed logic), so the demo runs offline and in
// CI with an identical result every time. A real frontier model drops in at the marked
// seam: replace `deterministicReasoner` with one whose invoke() calls the model (via MCP
// tools / A2A) and returns the same output shapes. The HARNESS around it — mandate checks,
// policy application, provenance, event-chaining — is unchanged either way.

// Parse criterion weights straight from the Policy's executable expression, so the agent
// applies the PUBLISHED rule rather than hard-coded weights.
function parseWeights(policy) {
  const e = policy.expression || "";
  const w = (name) => { const m = e.match(new RegExp(name + "\\s*\\*\\s*([\\d.]+)")); return m ? parseFloat(m[1]) : 0; };
  return { price: w("price"), quality: w("quality"), social: w("social") };
}

const deterministicReasoner = {
  kind: "deterministic",

  // Tool: evaluate.submission — apply the MAT weights to one submission's criterion scores.
  // input: { weights:{price,quality,social}, scores:{price,quality,social} }
  // output: { scores:[{criterion,value,weight}], total }
  invoke(tool, input) {
    if (tool === "evaluate.submission") {
      const { weights, scores } = input;
      const rows = ["price", "quality", "social"].map(c => ({ criterion: c, value: scores[c], weight: weights[c] }));
      const total = rows.reduce((s, r) => s + r.value * r.weight, 0);
      return { scores: rows, total: Math.round(total * 1e6) / 1e6 };
    }
    // Tool: award.decision — rank evaluations, pick the highest, explain why.
    if (tool === "award.decision") {
      const { evaluations, weights } = input;
      const ranked = [...evaluations].sort((a, b) => b.total - a.total);
      const win = ranked[0], runnerUp = ranked[1];
      const margin = runnerUp ? Math.round((win.total - runnerUp.total) * 1e6) / 1e6 : null;
      const rationale =
        `Most Advantageous Tender (price ${weights.price}, quality ${weights.quality}, social ${weights.social}). ` +
        `${shortId(win.submission)} scored ${win.total}` +
        (runnerUp ? `, ahead of ${shortId(runnerUp.submission)} at ${runnerUp.total} (margin ${margin}).` : ".");
      return { winner: win.submission, ranking: ranked.map(r => ({ submission: r.submission, total: r.total })), rationale };
    }
    throw new Error(`unknown tool ${tool}`);
  },
};

// ---- MODEL SEAM ---------------------------------------------------------------
// To run the demo against a real model, implement an object with the same invoke(tool,input)
// contract whose handlers call the model (e.g. Anthropic/Google) through MCP tools / A2A,
// and constrain its output to the shapes above. Nothing else in the runtime changes.
//
// const liveModelReasoner = { kind: "live-model", async invoke(tool, input) { /* model call */ } };
// -------------------------------------------------------------------------------

function shortId(did) { return (did || "").split("#").pop(); }

module.exports = { deterministicReasoner, parseWeights, shortId };
