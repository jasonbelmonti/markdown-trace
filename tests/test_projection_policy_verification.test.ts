import { describe, expect, it } from "vitest";
import { produceProjection, verifyProjection } from "../src/markdowntrace/document-graph/projection/index.js";
import { fixtureInput } from "./test_projection_policy_single.test.js";
import type { ProjectionPacket } from "../src/markdowntrace/document-graph/projection/contracts.js";

const original = () => {
  const input = fixtureInput();
  const produced = produceProjection(input);
  if (!produced.ok) throw new Error(JSON.stringify(produced.error));
  const packet: ProjectionPacket = JSON.parse(JSON.stringify(produced.value));
  return { input, packet };
};
const result = (input: ReturnType<typeof fixtureInput>, packet: unknown) => {
  const verified = verifyProjection(input, packet);
  if (!verified.ok) throw new Error(JSON.stringify(verified.error));
  return verified.value;
};

describe("fresh projection verification", () => {
  it("rejects deeply nested packet data without throwing", () => {
    const { input, packet } = original();
    const deep: unknown = JSON.parse("[".repeat(10_000) + "0" + "]".repeat(10_000));
    expect(result(input, deep).status).toBe("fail");
    expect(result(input, { ...packet, extra: deep }).status).toBe("fail");
  });

  it("passes a restored packet and distinguishes optional omission", () => {
    const { input, packet } = original();
    expect(result(input, packet)).toMatchObject({ status: "pass", policyStatus: "satisfied", diagnostics: [] });
    expect(packet.obligations.find(item => item.ruleId === "background")).toMatchObject({ status: "omitted", reasons: ["byte-budget"] });
  });

  it("rejects changed excerpt, reasons, evidence, roots, and forged completeness", () => {
    const { input, packet } = original();
    const edits = [
      (p: ProjectionPacket) => { (p.parts[1] as { text: string }).text += "changed"; },
      (p: ProjectionPacket) => { (p.parts[1].reasons[0] as { role: string }).role = "heading"; },
      (p: ProjectionPacket) => { (p.rules.find(row => row.ruleId === "acceptance")!.evidence as unknown[]).length = 0; },
      (p: ProjectionPacket) => { (p.request.roots as unknown[]).length = 0; },
      (p: ProjectionPacket) => { (p as { policyStatus: string }).policyStatus = "unsatisfied"; },
      (p: ProjectionPacket) => { (p.parts as unknown[]).splice(2, 1); },
    ];
    for (const edit of edits) {
      const changed: ProjectionPacket = JSON.parse(JSON.stringify(packet));
      edit(changed);
      expect(result(input, changed).status).toBe("fail");
    }
  });

  it("rejects stale caller expectations and packet identity without repinning", () => {
    const { input, packet } = original();
    expect(result({ ...input, sources: [{ ...input.sources[0], text: `${input.sources[0].text}edit` }] }, packet).status).toBe("stale");
    const changed: ProjectionPacket = JSON.parse(JSON.stringify(packet));
    (changed.identity.policy as { sha256: string }).sha256 = "0".repeat(64);
    expect(result(input, changed).status).toBe("stale");
  });

  it("does not verify an unchanged unsatisfied packet", () => {
    const input = { ...fixtureInput(), budget: { maxUtf8Bytes: 550, maxFragments: 11 } };
    const produced = produceProjection(input);
    if (!produced.ok) throw new Error(JSON.stringify(produced.error));
    expect(produced.value.policyStatus).toBe("unsatisfied");
    expect(result(input, JSON.parse(JSON.stringify(produced.value)))).toMatchObject({ status: "fail", policyStatus: "unsatisfied" });
  });

  it("bounds compact packet bytes and rejects hostile object shape", () => {
    const { input, packet } = original();
    const compactSize = Buffer.byteLength(JSON.stringify(packet));
    expect(verifyProjection(input, { ...packet, parts: Array(1000).fill(packet.parts[0]) })).toMatchObject({ ok: false, error: { code: "resource-limit" } });
    const hostile = Object.create({ inherited: true });
    expect(result(input, hostile).status).toBe("fail");
    expect(compactSize).toBeGreaterThan(0);
  });

  it("uses the exact compact transport length as the packet admission bound", () => {
    const base = fixtureInput();
    const initial = produceProjection(base);
    if (!initial.ok) throw new Error(initial.error.message);
    let n = Buffer.byteLength(JSON.stringify(initial.value));
    let input = { ...base, limits: { ...base.limits, maxPacketUtf8Bytes: n } };
    let produced = produceProjection(input);
    if (!produced.ok) throw new Error(JSON.stringify(produced.error));
    n = Buffer.byteLength(JSON.stringify(produced.value));
    input = { ...base, limits: { ...base.limits, maxPacketUtf8Bytes: n } };
    produced = produceProjection(input);
    if (!produced.ok) throw new Error(JSON.stringify(produced.error));
    expect(Buffer.byteLength(JSON.stringify(produced.value))).toBe(n);
    expect(result(input, JSON.parse(JSON.stringify(produced.value))).status).toBe("pass");
    const short = { ...input, limits: { ...input.limits, maxPacketUtf8Bytes: n - 1 } };
    expect(produceProjection(short)).toMatchObject({ ok: false, error: { code: "resource-limit" } });
  });

  it("rejects malformed trusted input before reading getters or packet claims", () => {
    const { input } = original();
    expect(verifyProjection({ ...input, roots: [] } as unknown as typeof input, {})).toMatchObject({
      ok: false, error: { code: "invalid-input" },
    });
    for (const field of ["limits", "policy", "sources"] as const) {
      const hostile = { ...input };
      let touched = false;
      Object.defineProperty(hostile, field, { enumerable: true, get() { touched = true; throw new Error("getter executed"); } });
      expect(verifyProjection(hostile, {})).toMatchObject({ ok: false, error: { code: "invalid-input" } });
      expect(touched).toBe(false);
    }
  });
});
