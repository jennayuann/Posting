<concept_spec>
concept Posting[User, Time]

purpose
    represents a time-bounded intention of a user to either lend or borrow,
    and provides an AI-assisted way to discover matching postings

principle
    a user creates a posting with a name, description, category, role (borrower or lender),
    and time window; the posting is initially active; the user may later update the posting
    or delete it; if a counterpart is found, the posting is marked as fulfilled;
    if the time window passes without fulfillment, the posting becomes expired.
    In addition, a user can use SmartMatch by inputting a natural-language description
    of what they want to borrow or lend and receive a ranked list of candidate postings
    that complement their need; if this AI component is unavailable, users can still search manually.

state
    a set of Postings with
        an owner User
        a role of BORROWER or LENDER
        a name String
        a category String
        an optional description String
        an optional availableFrom Time // if not given, availableFrom = current time
        an optional availableUntil Time // if not given, availableUntil = indefinite
        a status of ACTIVE or FULFILLED or CANCELLED or EXPIRED

actions
    createPosting(owner: User, role: BORROWER or LENDER, name: String, category: String, description: String?, availableFrom: Time?, availableUntil: Time?): Posting
        requires availableFrom and availableUntil if given forms a valid time window
        effect a new Posting is created with the given attributes;
               if availableFrom is not given, set it to current time;
               if availableUntil is not given, set it to indefinite;
               status is set to ACTIVE

    updatePosting(posting: Posting, newName: String?, newCategory: String?, newDescription: String?, newAvailableFrom: Time?, newAvailableUntil: Time?)
        requires given posting's status to be ACTIVE;
                 if provided, the new time window must be valid;
                 at least one of the optional attributes must be given
        effect posting is updated with any of the provided attributes

    cancelPosting(posting: Posting)
        requires posting's status to be ACTIVE
        effect posting's status becomes CANCELLED

    fulfillPosting(posting: Posting)
        requires posting's status to be ACTIVE
        effect posting's status becomes FULFILLED

    expirePosting(posting: Posting)
        requires posting's status to be ACTIVE and current time is after posting's availableUntil
        effect posting's status becomes EXPIRED

    deletePosting(posting: Posting)
        requires posting's status to be CANCELLED, FULFILLED, or EXPIRED
        effect posting is removed from the set of Postings

    smartMatch(queryText: String, queryRole: BORROWER or LENDER, currentTime: Time): (posting: Posting, rationale: String)[]
        effect returns a ranked list of ACTIVE postings whose role is complementary to queryRole
               and whose item semantically complements the given queryText as determined by the LLM;
               each returned posting also includes a short rationale string that explains why it was suggested
        note currentTime is provided so the LLM can resolve relative time expressions such as

notes
    In the implementation, each posting is given an "id" for efficient lookup and to reference postings in SmartMatch results.
    This is an implementation detail and not part of the abstract concept.

</concept_spec>
