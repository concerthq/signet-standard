# SIGNET Conformance Adapter Contract

To be assessed for **implementation conformance**, a candidate exposes a small
adapter implementing the interface below. The harness drives the adapter through
conformance scenarios; the adapter translates them into the implementation's own
operations. This keeps the suite identical for everyone (CN-2) while letting any
system — whatever its internals — be tested.

The adapter is a Node module exporting `createAdapter()`, which returns an object
with four methods. (Non-Node implementations expose the same four operations over
a thin local HTTP shim; a Node adapter then forwards to it. The reference adapter
is in-process.)

```js
module.exports = { createAdapter };

function createAdapter() {
  return {
    // Create a CDM object of `type` from `data`. MUST validate the object,
    // attach provenance, and emit an append-only Event that hash-chains to any
    // prior event for the same subject. Returns the stored document and the event.
    createObject(type, data) -> { document, event },

    // Apply a change to an existing subject. MUST emit a new Event whose
    // previousEventHash links to the subject's most recent event.
    applyChange(subjectId, change) -> { document, event },

    // Return the ordered Event stream for a subject (oldest first).
    getEvents(subjectId) -> [event, ...],

    // Project a CDM Invoice to a Peppol BIS Billing 3.0 (EN 16931) UBL string,
    // preserving all mapped Business Terms (CDM §8).
    projectInvoiceToUBL(invoice) -> string
  };
}
```

## Requirements the adapter must honour

- **Events.** Each Event MUST carry `id`, `eventType`, `subject`, `actor`,
  `timestamp`, and `provenance`. The first event for a subject MUST NOT carry a
  `previousEventHash`; every later event MUST set `previousEventHash` to the hash
  of the subject's immediately preceding event, using the canonical hash defined
  in `runner/lib.js` (`eventHash`). This is what makes the stream tamper-evident.
- **Provenance.** Each Event and each Decision MUST carry a `provenance` object
  with at least `generatedBy` and `generatedAt`.
- **Validation.** `createObject` MUST reject data that does not validate against
  the published schema for `type`.
- **Mapping.** `projectInvoiceToUBL` MUST preserve every mapped EN 16931 Business
  Term and produce reconciling totals.

## Determinism (CN-4)

Given the same inputs, the adapter MUST produce the same documents, events, and
projections (modulo timestamps/ids, which the harness normalises), so that any
third party can reproduce a conformance result.

See `reference-adapter.js` for a complete, conformant implementation, and
`broken-adapter.js` for a deliberately non-conformant one used to prove the
harness discriminates.
