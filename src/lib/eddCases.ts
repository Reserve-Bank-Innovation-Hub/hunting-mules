// What the branch finds when it goes to look.
//
// For eighty seconds the player has been the model: catching accounts on the shape
// of their transactions and nothing else. Enhanced due diligence (EDD) is the part
// of the real process where the bank finds out whether that shape had an innocent
// explanation. A questionnaire goes to the branch, an officer visits the address,
// and the visit ends in one of the verdicts printed on the form: Positive, meaning
// the account is released as a false positive, or Negative, meaning the freeze
// stands and a suspicious transaction report is filed.
//
// Every finding below is a field from the field-verification report banks use:
// occupation, residence, who was met, whether neighbours know the customer, name
// board sighted, employees seen. Every pattern in the game has a guilty case and an
// innocent one, because every pattern has a legitimate twin, and that is the lesson.

// LIB =================================================================================================================
import { EDD_RELEASES, EDD_VISITS } from "./gameConfig";
import { PatternBehaviour } from "./roundConfig";

// The form's own words. Positive releases the account; Negative confirms the freeze.
export type FvStatus = "positive" | "negative";

export interface EddFinding {
    label : string;
    value : string;
}

export interface EddCase {
    id        : string;
    behaviour : PatternBehaviour;          // The pattern the account was frozen for
    subject   : "individual" | "entity";   // The form has a page for each
    findings  : EddFinding[];              // Five at most. Read standing up, on a kiosk.
    verdict   : FvStatus;
    reveal    : string;                    // Why, in one breath
}

export const EDD_CASES : EddCase[] = [
    // FAN IN ==========================================================================================================
    {
        id        : "fan-in-kirana",
        behaviour : "fan-in",
        subject   : "individual",
        verdict   : "positive",
        findings  : [
            {label : "Occupation", value : "Business. Runs the kirana store below the flat"},
            {label : "Premises",   value : "Shop, owned, 12 years"},
            {label : "Name board", value : "Painted across the shop front"},
            {label : "Neighbours", value : "Know the customer well"},
            {label : "Reaction",   value : "Comfortable. Showed the day's UPI collections and the supplier bill paid from them"},
        ],
        reveal : "Released. A shop collecting the day's payments and paying one supplier looks exactly like fan-in. The pattern was real. The crime was not.",
    },
    {
        id        : "fan-in-vanished-tenant",
        behaviour : "fan-in",
        subject   : "individual",
        verdict   : "negative",
        findings  : [
            {label : "Occupation", value : "Student"},
            {label : "Residence",  value : "Rented room, 3 months"},
            {label : "Person met", value : "Landlord. The tenant left last month with no forwarding address"},
            {label : "Neighbours", value : "Never met the account holder"},
            {label : "Reaction",   value : "Could not be contacted. Phone switched off"},
        ],
        reveal : "Freeze confirmed. Nobody can find the account holder. A recruited mule hands the account over and disappears, and this is what that looks like from the branch.",
    },
    {
        id        : "fan-in-paper-nameplate",
        behaviour : "fan-in",
        subject   : "entity",
        verdict   : "negative",
        findings  : [
            {label : "Address",        value : "Entity contacted, at a residential flat"},
            {label : "Name board",     value : "Printed name on paper stuck to the door"},
            {label : "Premises",       value : "Residence, rented, 4 months. Under 500 sq ft"},
            {label : "Employees",      value : "6 to 10 declared. 1 seen"},
            {label : "Market enquiry", value : "Neighbouring shops do not know the firm"},
        ],
        reveal : "Freeze confirmed. A paper name on a rented flat door is not a trading company. The branch marks this Negative every time.",
    },

    // FAN OUT =========================================================================================================
    {
        id        : "fan-out-wage-run",
        behaviour : "fan-out",
        subject   : "entity",
        verdict   : "positive",
        findings  : [
            {label : "Address",    value : "Entity contacted at the recorded address"},
            {label : "Name board", value : "Outside the building"},
            {label : "Premises",   value : "Commercial, rented, 6 years. 500 to 1000 sq ft"},
            {label : "Employees",  value : "18 on the books. 15 seen at their machines"},
            {label : "Signatory",  value : "Met. Comfortable. The wage register matched every payout"},
        ],
        reveal : "Released. One payment in and many out on the same day is also what a wage run looks like. The register explained every leg.",
    },
    {
        id        : "fan-out-shell-consultancy",
        behaviour : "fan-out",
        subject   : "entity",
        verdict   : "negative",
        findings  : [
            {label : "Address",    value : "Entity not traceable. A different firm occupies the door"},
            {label : "Name board", value : "None seen"},
            {label : "Signatory",  value : "Not met. Neighbouring offices have never heard of the firm"},
            {label : "Employees",  value : "21 to 50 declared. None seen"},
            {label : "Complaints", value : "Two cybercrime portal complaints against the account"},
        ],
        reveal : "Freeze confirmed. A business nobody has heard of, at an address it does not occupy, with complaints already lodged. STR filed.",
    },
    {
        id        : "fan-out-vacant-plot",
        behaviour : "fan-out",
        subject   : "individual",
        verdict   : "negative",
        findings  : [
            {label : "Occupation",     value : "Recorded as farmer"},
            {label : "Residence",      value : "The recorded address is a vacant plot"},
            {label : "Person met",     value : "Nobody. The village head says the holder moved to the city years ago"},
            {label : "Neighbours",     value : "Recall the name, not the person"},
            {label : "Visit comments", value : "Address on record does not match the KYC document"},
        ],
        reveal : "Freeze confirmed. A farmer's account paying thirty accounts a day, from a plot with nothing on it. Address not traceable. Negative.",
    },

    // GATHER AND SCATTER ==============================================================================================
    {
        id        : "gather-scatter-decorator",
        behaviour : "gather-scatter",
        subject   : "individual",
        verdict   : "positive",
        findings  : [
            {label : "Occupation", value : "Self-employed. Wedding decorator"},
            {label : "Residence",  value : "Individual house, owned, 20 years"},
            {label : "Person met", value : "Account holder"},
            {label : "Reaction",   value : "Comfortable. Showed the client's advance, and the florist, caterer and tent bills paid from it that evening"},
            {label : "Neighbours", value : "Know the family"},
        ],
        reveal : "Released. A contractor takes an advance and pays the vendors the same evening. Gather and scatter, and entirely legitimate.",
    },
    {
        id        : "gather-scatter-rented-account",
        behaviour : "gather-scatter",
        subject   : "individual",
        verdict   : "negative",
        findings  : [
            {label : "Occupation",     value : "Recorded as salaried. Could not name an employer"},
            {label : "Residence",      value : "Rented, 2 months. Notice already given"},
            {label : "Person met",     value : "Account holder"},
            {label : "Reaction",       value : "Uncomfortable. Said a friend uses the account and pays a cut"},
            {label : "Visit comments", value : "Funds fully washed out within minutes of each credit"},
        ],
        reveal : "Freeze confirmed. The holder admitted renting the account out. That is a mule by definition, whatever the pattern.",
    },

    // LOW BALANCE =====================================================================================================
    {
        id        : "low-balance-hostel-fees",
        behaviour : "low-balance",
        subject   : "individual",
        verdict   : "positive",
        findings  : [
            {label : "Occupation", value : "Student, second year"},
            {label : "Residence",  value : "College hostel (quarters)"},
            {label : "Person met", value : "Account holder and the warden"},
            {label : "Reaction",   value : "Comfortable. The inflow was the semester fee from home, paid to the college the next morning"},
            {label : "Neighbours", value : "Hostel staff identified the student at once"},
        ],
        reveal : "Released. An account that idles on a few hundred rupees will take in a lakh once a term. The mismatch was real, and so was the fee receipt.",
    },
    {
        id        : "low-balance-recruited-teen",
        behaviour : "low-balance",
        subject   : "individual",
        verdict   : "negative",
        findings  : [
            {label : "Occupation",     value : "Student, 18. Account opened five weeks ago"},
            {label : "Residence",      value : "Family home, owned. Parents unaware the account existed"},
            {label : "Person met",     value : "Father"},
            {label : "Reaction",       value : "Uncomfortable. Could not say who sent ₹1.4 lakh, or why it left within the hour"},
            {label : "Visit comments", value : "Debit card and SIM handed to a recruiter for ₹3,000"},
        ],
        reveal : "Freeze confirmed. A brand-new account, a teenager, and a sum nobody can explain. Age and account age are two of the strongest signals a bank has.",
    },
];

// A case as it is dealt for one round: whether it stands for an account this player
// actually froze, or one the model flagged that they never got to
export interface EddVisitCase extends EddCase {
    isPlayerCatch : boolean;
}

// Fisher-Yates, not a random-comparator sort. The innocent case must be equally
// likely in every position, and a comparator shuffle is measurably biased on a
// list of three: the last slot came up a quarter of the time rather than a third.
const shuffle = <T,>(items : T[]) : T[] => {
    const copy = [ ...items ];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ copy[i], copy[j] ] = [ copy[j], copy[i] ];
    }
    return copy;
};

/**
 * Deal the visits for one round.
 *
 * Exactly EDD_RELEASES of them are false positives and the rest are confirmed, in a
 * random order, so the innocent one can never be found by its position. Cases are
 * drawn towards the patterns the player actually caught, because "you froze this
 * account for fan-in" lands harder than a pattern they never touched. Where the
 * player caught fewer accounts than there are visits, the rest are accounts the
 * model flagged, so a zero-score run still gets the lesson.
 */
export const drawVisits = (caught : Map<string, PatternBehaviour>) : EddVisitCase[] => {
    const remaining = new Map<PatternBehaviour, number>();
    caught.forEach(behaviour => remaining.set(behaviour, (remaining.get(behaviour) ?? 0) + 1));

    // Shuffled first, then stably sorted, so a caught pattern always comes ahead of an
    // uncaught one but the choice among caught patterns is fresh every round
    const isUncaught = (c : EddCase) => Number(!remaining.has(c.behaviour));
    const prefer = (cases : EddCase[]) => shuffle(cases).sort((a, b) => isUncaught(a) - isUncaught(b));

    const releases = prefer(EDD_CASES.filter(c => c.verdict === "positive")).slice(0, EDD_RELEASES);

    // Confirmed cases are picked to differ in pattern from each other and from the
    // release wherever the library allows, so three visits show three shapes
    const confirmed : EddCase[] = [];
    const pool = prefer(EDD_CASES.filter(c => c.verdict === "negative"));
    while (confirmed.length < EDD_VISITS - EDD_RELEASES && pool.length > 0) {
        const taken = new Set([ ...releases, ...confirmed ].map(c => c.behaviour));
        const index = Math.max(0, pool.findIndex(c => !taken.has(c.behaviour)));
        confirmed.push(pool.splice(index, 1)[0]);
    }

    // Each visit stands for one of the player's catches while there are catches left
    // to stand for; after that it is an account the model flagged
    return shuffle([ ...releases, ...confirmed ]).map(c => {
        const left = remaining.get(c.behaviour) ?? 0;
        if (left > 0) {
            remaining.set(c.behaviour, left - 1);
        }
        return {...c, isPlayerCatch : left > 0};
    });
};
