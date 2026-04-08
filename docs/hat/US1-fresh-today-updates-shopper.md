# HAT: User Story 1 — Fresh Today updates (shopper)

**Related issue:** [#62 — HAT: Fresh Today (shopper)](https://github.com/gsha22/GrocerEase/issues/62)  
**Implementing PR:** _Add PR link here when tracked in #62._  
**Tester:** Scarlett Huang

## User story

As a shopper deciding whether a local store is worth visiting, I want to see a store's recent "fresh today" or "newly in stock" updates on its profile page so that I can make an informed decision about whether to make the trip before I leave home.

## Prerequisites

- At least one store profile exists with a published "Fresh Today" update posted within the last 2 hours.
- At least one store profile has an update older than 48 hours.
- At least one store profile has no updates in the last 7 days.

## Steps executed

Protocol from issue #62 (record results after the session):

1. Open the application in your browser and navigate to the store directory.
2. Select a store that has recent "Fresh Today" updates (the test coordinator will tell you which one).
3. On the store profile page, locate the "Fresh Today" section.
4. Note whether each update shows an item name, an optional note, and a relative timestamp (e.g., "posted 2h ago").
5. Observe whether updates older than 48 hours are visually de-emphasized compared to newer ones.
6. Navigate to a store that has no updates in the last 7 days and observe how that empty state is displayed.
7. Return to the store with recent updates. Time yourself: from the moment the page loads, how long does it take you to determine whether this store has something you might want? _(Record seconds for metric 1.)_

## Metrics evaluation

Rationale (from test design): (1) **Time-to-decision** mirrors The Mom Test—behavior over opinions. (2) **Perceived freshness trust** is a Lean Startup learning metric for whether uncertainty about chains is reduced. (3) **Return intent** is a retention / habit-leading indicator vs one-time use.

| # | Metric | Result | Observation |
|---|--------|--------|-------------|
| 1 | **Time-to-decision** (seconds from page load to "I'd go / I wouldn't go") | _TBD_ | _Fill after timed step 7._ |
| 2 | **Perceived freshness trust** (does the shopper believe the information is current?) | _TBD_ | |
| 3 | **Return intent** (would the shopper check this page again before their next grocery trip?) | _TBD_ | |

## Survey

### Q1. Think about the last time you checked a store's social media or website before deciding to visit. How does the information you saw on this page compare to that experience?

**Answer:** She doesn't really check social media or websites of grocery stores unless it's a big chain store (e.g. Target, Walmart) where you can easily check up on inventory + she's looking for a very specific thing. 

### Q2. If you were planning a grocery run tomorrow morning, would you open this page first — or would you just drive to your usual store? Why?

**Answer:** If she knew about the existence of this site, she would check really quickly before leaving. 

### Q3. Was there anything on the page that made you doubt whether the information was actually up to date?

**Answer:** She thought that the dates of deals/fresh updates were helpful in determining how up to date the information was. 

## Iteration
None. 
