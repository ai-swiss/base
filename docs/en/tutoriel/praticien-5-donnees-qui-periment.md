<!-- fr-synced: fb72357682a278742e8af5a2c5215d49a93ad6c0 -->
# Data That Expires

*⏱ ~10 min · module 5/9, Practitioner track*

**You will**: have an expired piece of data flagged, then watch it disappear, using base doctor, proven by the ✅ below.
**You need**: module 1 finished, a terminal in `exemples/veytaux-tourisme`.
↻ **Recall**: without looking: what makes a request route to a process? (its use_when and its examples)

1. Run `base doctor --root .`. Spot the signal on `infos/agenda.md`.
2. Open `infos/agenda.md`: the `valid_until` field is a past date (that's on purpose,
   for the exercise).
3. Push `valid_until` out to a future date (a week from now, for example), and save.
4. Run `base doctor --root .` again.

✅ **Check**: after the fix, `base doctor` no longer flags `infos/agenda.md` as expired (the `expired` signal is gone).

💡 **Why it worked**: expertise ages. `valid_until` declares the lifespan of a piece of reference data; `base doctor` projects these dates onto your files to spot what is about to break, without running anything, by simple reading. Maintenance becomes visible.

🔁 **At home**: which piece of data in your domain (a price, a rate schedule, a seasonal rule) should carry a validity date?

→ **Next**: [Module 6: open the Studio](praticien-6-ouvrez-l-atelier.md): we move to Studio and connect a model.

🆘 **Common failures**: *doctor flags nothing*: you're not in `exemples/veytaux-tourisme`. *The signal stays after the fix*: is the date really in the FUTURE, and the file saved?
