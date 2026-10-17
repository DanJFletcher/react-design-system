---
name: Native stepper disabled-state handling
description: Keep native steppers’ disabled behavior declarative and avoid unreachable click-handler branches.
---

For native numeric steppers, put disabled, read-only, and unsupported-step conditions on the actual step buttons. Avoid duplicating those conditions in their click handlers when the handler is only reachable through those buttons.

**Why:** Native disabled buttons prevent activation, so repeated handler guards add paths users cannot trigger and make the library-wide 100% branch-coverage target artificial.

**How to apply:** When adding or changing step controls, verify the button’s disabled state for each constraint and test normal increment/decrement behavior. Keep a handler guard only when a real public interaction can reach that condition.
