<!-- fr-synced: ec9d02b13cf99b8cb102272c262bbc6ad8624da3 -->
# Open the Studio, connect a model

*⏱ ~10 min · module 6/9, Practitioner track*

**You will**: have the Studio open and a model connected, ready to evaluate, proven by the ✅ below.
**You need**: module 5 finished.
↻ **Recall**: without looking, what does base doctor do? (it flags what is about to break)

1. Launch the Studio: `base studio --root exemples/veytaux-tourisme`. Your browser opens.
2. **Settings** tab. If there is no provider, the "Connect a model" guide appears.
3. Follow the path that is simplest for you (local Ollama with no key, or an API key that you
   paste into your terminal). The guide prints the next step every time.
4. Once the connection test is green, click "set as evaluation defaults".

✅ **Check**: the Settings screen shows your provider with a green connection test, and your evaluation defaults are set.

💡 **Why it worked**: Studio is the workshop, it works on the SAME files as your AI tool. API keys are never typed or stored in the screen: you name an environment variable, which keeps your secrets out of the files.

🔁 **At home**: which model will you use for your evaluations, a local model (free, private) or an API (more powerful)?

→ **Next**: [Module 7: the first evaluation](praticien-7-premiere-evaluation.md).

🆘 **Common failures**: *"No model"* after installing Ollama: reload the Settings page. *The key is not detected*: export the variable in the SAME terminal as `base studio`, then relaunch.
