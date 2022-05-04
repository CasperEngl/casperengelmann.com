---
title: imapsync app
subtitle: Transfer your email accounts with a GUI
---

_Preface: imapsync is an OSS tool created by Gilles Lamiral. Show him your support. My project has no connection to him whatsoever._

## Links

Gilles:

Website: https://imapsync.lamiral.info/  
GitHub: https://github.com/imapsync/imapsync/

Me:

GitHub: https://github.com/casperengl/imapsync-app

## The Story

I've previously worked at a company that, as one of their products, provided email support and would transfer mails from their clients old provider.

This was all a manual process involving Teamviewer and many, MANY hours spent each week going communicating back and forth between clients. Each client had their own email client, which the support team would log into, export the mail, upload the mail again on the new provider.

Something had to be done about that. We looked for a solution that could (hopefully) do this automatically.

This is where we found imapsync. A CLI for transferring between two hosts, that (almost) always worked perfectly.

**If imapsync wasn't working, it was really down to the client having very specific circumstances, that imapsync could not handle.**

I'd say 95% of the time imapsync worked without a hitch.

## React

Since imapsync was a pure CLI tool and not everyone on the support team was familiar with that, we had to make it easier to handle writing the command for the terminal.

I thought, _maybe_, just _maybe_, I could handle this with React.

**Mind you, this was the early days of my frontend career, so the task for indeed challenging.**

Basically, each transfer from one host to another would have 6 input fields, `host1`, `user1`, `password1`, `host2`, `user2`, `password2` respectively.

Redux was the big thing at this point in time, 2017, and React Context wasn't a thing back then, it wouldn't be until a year later. So I started learnig about Redux.

A lot of boilerplate later, I got the inputs synced to the redux state, added the functionality to add multiple transfer and out came a single CLI command that anyone on the support team could run.

**We all had imapsync installed into our ~/Applications directory which is where the command would point to.**

We already cut down on the time spent transfering emails by an order of magnitude.

## Electron

_Time passes by._

While this solution worked, it could definitely be improved.

Do we really have to place the CLI bin in a specific directory on each computer? (~/Applications)

Why not see if we can build the CLI bin into the application?

But how can I do that? CLI bins don't work in the browser.

I knew I had to somehow make it run directly on the computer, I just didn't know how yet.

I researched how to make my existing React app into a "native" app that could run on our computers. I came across Electron, which seemed to be able to output for both Mac and PC, which in our case, were the computers we used.

### The app

After porting the frontend code to the Electron app, I started working on implementing the CLI bin code.

At this point, I had also done a little bit of NodeJS development. It's awesome for creating all kinds of scripts.

I knew NodeJS could spawn new processes, so what if I could run the imapsync CLI inside one of those processes?

To my surprise, after figuring out how to communicate between the front- and backend, it kinda just worked. imapsync has a few different binaries, so I also had to find out how to detect the system my app was running on. This was pretty trivial, but something to think of.

Now it ran each transfer in succession to the previous, and it was great. So great I didn't even mind the app being disabled while it was doing its thing. Really, in the start, the app would just do the work, without any output.

Soon I discovered I could listen to `stdout.on('data', myMethod)`, and get the output. So I added a black box with green text (as any _Hackerman_ would do).

### Adding features

I soon added a few basic preferences, so you could customize the appearance of a few elements.

It also became apparant, that my previous design didn't work (I was using basic Bootstrap, eww, I know). So I redesigned it.

With it looking all pretty, I also implemented a few basic features, such as a log history written to disk, the ability to cancel transfers as well as exporting the transfer list, so that it could be backed up, shared and/or prepared ahead of time.

## The end

I had no idea this story would be this long, but here we are.

This was definitely a story that propelled my frontend career, as well as my NodeJS skills and generally became a lot better at structuring my code.

It was also the first project I dared to use TypeScript on, but that's definitely a story I don't want to write about right now.
