# raft_visualization
A interactive simulation of the Raft algorithm using a JavaScript animation.

Three nodes persist a replicated log of data received a single client that fades in and out from the simulation. The nodes use
the Raft algorithm to achieve consensus on the log.

Turn down nodes by clicking them. Pause the simulation and click in-flight messages to drop them.

Share this simulation by embedding it in whatever page you want using an inframe:

```
<iframe src="https://ritmatter.github.io/raft_visualization/"></iframe>
```

Or, just play without yourself by going to the link directly.

Read about my process creating this simulation on my personal site: https://www.mattritter.me/?p=107
