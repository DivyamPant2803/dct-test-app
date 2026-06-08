Sensitive Data Detector — Technical Specification
1. Purpose & positioning
This module provides a pure-function detector for sensitive personally identifiable information (PII) in Indian regulatory contexts, intended to run client-side on text extracted from user-uploaded documents before that text is transmitted to or stored by backend systems. It is a defense-in-depth layer, not a primary security control. Downstream code, compliance reviews, and audits MUST NOT treat its output as sufficient to certify a document as PII-free; it exists to catch the easy cases at the edge before they reach systems with broader blast radius. The module exists despite the availability of mature alternatives (Microsoft Presidio, Google DLP, AWS Comprehend) because (a) those services require sending document text off-device, which contradicts the client-side requirement, and (b) their Indian-format coverage is inconsistent and lags real-world format drift. Every maintainer of this module must internalize that detector recall is never 100%; the spec is written accordingly.
2. Function signature
typescriptfunction scanText(input: string): ScanResult;
The function is pure: same input always produces same output, no I/O, no side effects, no async. Synchronous return.
3. Input / output contract
typescripttype PIIType =
  | 'AADHAAR'
  | 'PAN'
  | 'CREDIT_CARD'
  | 'GSTIN'
  | 'PHONE'
  | 'EMAIL'
  | 'IFSC';

type Severity = 'HIGH' | 'MEDIUM' | 'LOW';

interface Match {
  /** Detected PII category. */
  type: PIIType;
  /** The exact substring of input that was matched (post-normalization may differ; see section 6). */
  value: string;
  /** Inclusive start offset in the original input string, in UTF-16 code units. */
  start: number;
  /** Exclusive end offset in the original input string, in UTF-16 code units. */
  end: number;
  /** Severity tier as defined in decisions. */
  severity: Severity;
}

interface ScanResult {
  /** Matches after overlap resolution, sorted by `start` ascending. Stable ordering. */
  matches: Match[];
  /** Input with all matched ranges replaced per redaction algorithm (section 6). */
  redacted: string;
}
Contract notes carried as reasoning:

Offsets are UTF-16 code units (JavaScript-native), not grapheme clusters. Rationale: callers will use these offsets with native String.prototype.slice/substring; using anything else creates off-by-one bugs at the boundary.
value reflects the substring as it appears in the input, including any internal whitespace or separators. Rationale: highlighting in a UI requires the original characters, not the normalized form.
Matches are sorted by start; ties are impossible after overlap resolution (section 5).
Empty input returns { matches: [], redacted: '' }. Null/undefined input is a programmer error; behavior is unspecified.

4. Detection rules per PII type
For each PII type below: regex used for candidate extraction, followed by validation logic that confirms or rejects each candidate. Regex alone is never sufficient for tier-1 types.
4.1 AADHAAR — severity HIGH
regex/(?<!\d)(\d{4}[\s\-]?\d{4}[\s\-]?\d{4})(?!\d)/g
Validation: Strip all whitespace and hyphens from the candidate. Verify the result is exactly 12 digits. Run the Verhoeff algorithm over all 12 digits; the result must equal 0. Reject candidates beginning with 0 or 1 (UIDAI does not issue Aadhaar numbers starting with these digits).
Rationale: Regex shape alone has ~30% false-positive rate on real documents (invoice numbers, order IDs); Verhoeff plus the leading-digit rule eliminates the vast majority. Negative lookbehind/lookahead on \d prevents matching mid-number from a longer digit string.
4.2 PAN — severity MEDIUM
regex/(?<![A-Z0-9])([A-Z]{5}\d{4}[A-Z])(?![A-Z0-9])/g
Validation: The 4th character must be one of P C H F A T B L J G (valid entity-type codes; P = individual, C = company, etc.). The 5th character must be an uppercase letter (already guaranteed by regex). No checksum verification is publicly documented for PAN; structural validation is the strongest available signal.
Rationale: PAN has a deterministic structure but no published checksum, so we lean on entity-type-code validation. The lookarounds prevent matching inside longer alphanumeric tokens (e.g. order references). Case-sensitive match is required because the regulatory format is uppercase; lowercase PANs in input must be uppercased before validation (see edge cases, section 7).
4.3 CREDIT_CARD — severity HIGH
regex/(?<!\d)(\d(?:[\s\-]?\d){12,18})(?!\d)/g
Validation: Strip all whitespace and hyphens. Verify length is between 13 and 19 digits inclusive. Run the Luhn algorithm; the check digit must validate. Additionally, the first digit (or IIN range) should fall within known card-network prefixes (Visa starts with 4; Mastercard 51–55, 2221–2720; Amex 34, 37; RuPay 60, 65, 81, 82; etc.). Implementations MAY skip the IIN check and rely on Luhn alone, but doing so increases false-positive rate.
Rationale: Luhn is the strongest standard validator for card numbers. The IIN check is documented as a recommended additional filter; without it, ~6% of random 16-digit Luhn-valid strings will be false positives.
4.4 GSTIN — severity MEDIUM
regex/(?<![A-Z0-9])(\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z]\d|\d{2}[A-Z]{5}\d{4}[A-Z]\dZ[A-Z\d])(?![A-Z0-9])/g
Validation: Verify total length is exactly 15. Verify the embedded PAN (positions 3–12) passes PAN structural validation per section 4.2. Verify position 13 (entity number within state) is alphanumeric. Verify position 14 is Z (fixed). Run the GSTIN mod-36 checksum over positions 1–14; the result must equal position 15.
Rationale: GSTIN embeds a PAN, so reusing PAN validation here is correct and cheap. The mod-36 checksum is publicly documented by the GST Network and is the strongest available signal.
4.5 PHONE — severity LOW
regex/(?<!\d)(?:\+?91[\s\-]?|0)?([6-9]\d{9})(?!\d)/g
Validation: Strip whitespace, hyphens, and leading country/trunk prefix. Verify exactly 10 digits starting with 6, 7, 8, or 9 (TRAI-allocated mobile prefix range as of 2024). Landlines are NOT detected in v1 — they have higher false-positive rates and are less commonly considered PII.
Rationale: No checksum exists for Indian mobile numbers. Regex with the leading-digit constraint is the strongest available signal. Severity LOW reflects the inherent uncertainty.
4.6 EMAIL — severity LOW
regex/(?<![A-Za-z0-9._%+-])([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})(?![A-Za-z0-9.-])/g
Validation: None beyond regex shape. Local-part length must be ≥1; domain must contain at least one dot; TLD must be ≥2 letters. RFC 5322 compliance is explicitly NOT a requirement (full RFC regex is impractical and produces no precision gain in practice).
Rationale: Emails have no checksum and a permissive standard. The simplified regex catches >99% of real emails; the rare edge cases (quoted local parts, IP-literal domains) are not worth the complexity in v1. Severity LOW reflects that email is often less sensitive than other PII.
4.7 IFSC — severity LOW
regex/(?<![A-Z0-9])([A-Z]{4}0[A-Z0-9]{6})(?![A-Z0-9])/g
Validation: Verify length is exactly 11. Verify position 5 is 0 (RBI-mandated separator). Verify the 4-letter prefix is from a known bank-code list (e.g. SBIN, HDFC, ICIC, AXIS, PUNB, KKBK, etc.). If a bank-code list is unavailable to the implementation, structural validation alone is acceptable but increases false-positive rate.
Rationale: IFSC has no checksum; the bank-code prefix is the strongest validator. The bank-code list is publicly available from RBI and should be embedded as a constant. Severity LOW reflects that IFSCs are public information (printed on cheques) and only sensitive in combination with account numbers, which v1 does not detect.
5. Overlap resolution algorithm
Multiple regex passes will produce candidate matches that may overlap in their character ranges (e.g. a 16-digit string can match both CREDIT_CARD and a generic numeric pattern; an embedded PAN inside a GSTIN will match both). Overlap resolution produces the final non-overlapping match list.
Algorithm (pseudocode):
1. Collect all validated candidates from all detection rules into a single list C.
2. Sort C by:
     a. severity descending (HIGH > MEDIUM > LOW),
     b. then by (end - start) descending (longer span wins ties),
     c. then by start ascending (earlier match wins remaining ties — deterministic).
3. Initialize an empty list R (accepted matches) and an empty set O (occupied offsets).
4. For each candidate c in C, in sorted order:
     a. If any offset in [c.start, c.end) is in O, discard c.
     b. Else, append c to R and add all offsets in [c.start, c.end) to O.
5. Sort R by c.start ascending.
6. Return R.
Notes carried as reasoning:

Highest-severity-wins is correct because the user-facing risk of a missed credit card outweighs the cost of a missed lower-severity match within the same span.
Longest-span-wins on ties prefers GSTIN over the PAN embedded within it, which matches user expectations.
Step 4(a) uses an interval-membership check; an O set is conceptually correct but in practice should be implemented with a sorted interval list for performance on large inputs (this is an implementation detail, not a spec constraint).
The algorithm is O(n log n) in candidate count due to the sort; for any realistic document size this is irrelevant.

6. Redaction algorithm
Produces the redacted string from the input and the final match list.
Algorithm (pseudocode):
1. Initialize an empty string output and a cursor at position 0.
2. For each match m in matches (already sorted by start ascending):
     a. Append input.slice(cursor, m.start) to output.
     b. Append the literal token `[<m.type>]` to output — e.g. `[AADHAAR]`, `[CREDIT_CARD]`.
     c. Set cursor = m.end.
3. Append input.slice(cursor) to output (remainder after last match).
4. Return output.
Notes carried as reasoning:

The token format [<TYPE>] is intentionally readable and leakage-free; preserving last-4 digits (as some redaction schemes do) is rejected because it would leak partial PII into logs and screenshots, defeating the purpose.
Multiple instances of the same PII type produce identical tokens; downstream callers needing to distinguish them should use the matches array, not the redacted string.
Whitespace and punctuation between PII instances is preserved verbatim. Rationale: redacted text must remain readable to a human reviewer.

7. Edge cases the implementation must handle

Whitespace variations. Aadhaar may appear as 1234 5678 9012, 1234-5678-9012, or 123456789012. Card numbers similarly. Detection MUST handle all three forms; value in the returned Match retains the original separators.
Case sensitivity. PAN, GSTIN, and IFSC regulatory formats are uppercase, but user input may contain lowercase. Normalize candidates to uppercase before structural/checksum validation; the value field retains the original casing.
Adjacent matches. Two PII values separated only by punctuation or whitespace (e.g. Email: a@b.com Phone: 9876543210) must both be detected with correct offsets; the negative lookarounds in the regexes are responsible for this.
Boundary conditions. A PII value at position 0 of the input, or extending to the final character (end-of-string), must be detected. Lookbehinds/lookaheads MUST treat string boundaries as non-matching for \d, [A-Z0-9], etc., which is JavaScript's default behavior; verify with explicit tests.
Repeated occurrences. The same exact value appearing multiple times (e.g. an Aadhaar number quoted twice) produces multiple Match entries with distinct offsets.
Mixed content. A single line containing multiple PII types must produce one match per instance; overlap resolution applies only to truly overlapping ranges.
Unicode normalization. Input is assumed already normalized; the detector does not perform NFC/NFD normalization. Rationale: OCR layer responsibility.
Empty matches. Regex implementations must not produce zero-length matches. The patterns above are constructed to make this impossible, but implementations must defensively guard against it.

8. Acceptance criteria
Each criterion shows the input string and the expected ScanResult. All offsets are UTF-16 code units.
8.1 Positive: clean Aadhaar with spaces
Input: "My Aadhaar is 2345 6789 1238"
Expected:
json{
  "matches": [
    { "type": "AADHAAR", "value": "2345 6789 1238", "start": 14, "end": 28, "severity": "HIGH" }
  ],
  "redacted": "My Aadhaar is [AADHAAR]"
}
(Note: the digits used in this example must be a real Verhoeff-valid Aadhaar test number; implementations MUST verify with their Verhoeff implementation before using this fixture.)
8.2 Positive: PAN inline
Input: "PAN: ABCPK1234F submitted"
Expected:
json{
  "matches": [
    { "type": "PAN", "value": "ABCPK1234F", "start": 5, "end": 15, "severity": "MEDIUM" }
  ],
  "redacted": "PAN: [PAN] submitted"
}
8.3 Positive: credit card with hyphens, Luhn-valid
Input: "Card 4539-1488-0343-6467 on file"
Expected:
json{
  "matches": [
    { "type": "CREDIT_CARD", "value": "4539-1488-0343-6467", "start": 5, "end": 24, "severity": "HIGH" }
  ],
  "redacted": "Card [CREDIT_CARD] on file"
}
8.4 Positive: multiple PII types in one input
Input: "Contact a@b.com or 9876543210 for queries"
Expected:
json{
  "matches": [
    { "type": "EMAIL", "value": "a@b.com", "start": 8, "end": 15, "severity": "LOW" },
    { "type": "PHONE", "value": "9876543210", "start": 19, "end": 29, "severity": "LOW" }
  ],
  "redacted": "Contact [EMAIL] or [PHONE] for queries"
}
8.5 Positive: overlap resolution — GSTIN beats embedded PAN
Input: "GSTIN 27ABCPK1234F1Z5 verified" (assuming valid mod-36 checksum)
Expected:
json{
  "matches": [
    { "type": "GSTIN", "value": "27ABCPK1234F1Z5", "start": 6, "end": 21, "severity": "MEDIUM" }
  ],
  "redacted": "GSTIN [GSTIN] verified"
}
The embedded PAN ABCPK1234F at positions 8–18 is suppressed by overlap resolution (longer span at same severity tier wins).
8.6 Adversarial: invoice number matching Aadhaar shape, not Verhoeff-valid
Input: "Invoice 1234 5678 9012 attached"
Expected:
json{
  "matches": [],
  "redacted": "Invoice 1234 5678 9012 attached"
}
The string matches the Aadhaar regex shape but fails Verhoeff validation; it MUST NOT be flagged.
8.7 Adversarial: 16-digit order ID that fails Luhn
Input: "Order #1234567890123456 dispatched"
Expected:
json{
  "matches": [],
  "redacted": "Order #1234567890123456 dispatched"
}
The string is 16 consecutive digits but does not pass Luhn validation; it MUST NOT be flagged.
8.8 Adversarial: US phone number, not Indian format
Input: "Call +1 415-555-0182 anytime"
Expected:
json{
  "matches": [],
  "redacted": "Call +1 415-555-0182 anytime"
}
The number does not match the Indian mobile format (no +91 or 0 prefix, leading digit 4 outside the 6–9 range); it MUST NOT be flagged.
8.9 Positive boundary: PII at start and end of input
Input: "9876543210 is my number"
Expected:
json{
  "matches": [
    { "type": "PHONE", "value": "9876543210", "start": 0, "end": 10, "severity": "LOW" }
  ],
  "redacted": "[PHONE] is my number"
}
9. Explicit non-goals

No UI components
No OCR integration
No worker threads or async APIs
No streaming or incremental detection
No OCR-noise correction
No contextual cue analysis

10. Known risks and maintenance notes

Load-bearing dependency. Once this module ships, every miss becomes an incident the tool owns; downstream code, audits, and compliance reviews will assume "the scanner caught it" and design around that assumption. Detector recall is never 100%. This module MUST be positioned in product documentation, runbooks, and security reviews as a defense-in-depth layer only, never as a primary control. The day this assumption breaks is the day a real PII leak is blamed on the scanner.
Format drift over time. Aadhaar masking conventions change as UIDAI policy evolves. New ID types appear regularly (ABHA health IDs, e-Shram numbers, APAAR education IDs). Card network IIN ranges expand. Regex assumptions decay silently — there is no automated signal that a format has shifted. This module needs a designated owner with calendar-driven format reviews at least quarterly.
Existence of alternatives. Microsoft Presidio, Google DLP, and AWS Comprehend are mature, well-funded, and offer broader PII coverage than this module ever will. The documented reasons to build our own are (a) the client-side requirement (those services require server-side calls, contradicting the "no data leaves the browser before scan" constraint), and (b) inconsistent Indian-format coverage in the alternatives. If either of these conditions changes — a viable client-side library appears, or alternatives close the Indian-format gap — this module should be reconsidered, not extended.
Adversarial inputs. The detector is not designed to resist deliberate evasion (e.g. inserting zero-width spaces inside an Aadhaar, base64-encoding PII, image-based leakage). Users determined to bypass the scanner can do so trivially; this module is a guardrail against accidental leakage, not an adversary.
OCR noise. When upstream OCR substitutes O for 0, I for 1, or S for 5, the detector will miss the match. This is intentional: noise correction belongs in the OCR layer where confidence scores and language models are available. If OCR confidence is low, the system should warn the user that the scan may be incomplete, regardless of detector output.

