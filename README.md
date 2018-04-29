# Kwote Loader

Loads data into the [Kwotes](https://github.com/dmarkrollins/kwote) application.

We had data in an access db that we needed to import - Access lets you easily dump data to XML so that is what we started with.

Also the incoming Quote.body field was rich text so we needed to convert that as well to HTML to stuff into the DB etc.

Anyways, 3 files are expected:

## Quotes

```XML
<Quote>
<ID>230</ID>
    <ShortTitle>Wee Hours, Midnight, Night</ShortTitle>
    <Body>{\rtf1\ansi\ansicpg1252\deff0\deflang1033{\fonttbl{\f0\fnil\fcharset0 Courier New;}}
    \viewkind4\uc1\pard\f0\fs16 I&apos;ve always thought the small hours was a deep, tender, and terrible time. Late at night all the fat and sweetness of things are gone, and you feel hard up against the cold bare facts.  If you think too much in the wee hours your life don&apos;t seem worth nothing.  Late atr night you feel stripped dowon to the bone and facing the emptiness and awfulness of the world.
    \par from Robert Morgan \ul This Rock\ulnone (Scribner paperback, 2001) p. 72.  Muir, th North Carolina aspiring preacher, and trapper, worker, loyal son of his widowed mother, thinks deeply about life.  }
    </Body>
</Quote>
...
```

## Categories

```XML
<?xml version="1.0" encoding="UTF-8"?>
<dataroot xmlns:od="urn:schemas-microsoft-com:officedata" generated="2018-04-25T06:02:17">
<Category>
    <Quote>229</Quote>
    <Name>Trials</Name>
</Category>
...
```

## Projects

```XML
<?xml version="1.0" encoding="UTF-8"?>
<dataroot xmlns:od="urn:schemas-microsoft-com:officedata" generated="2018-04-25T06:00:03">
<Project>
    <Name>Grandy Lecture Mark</Name>
    <Quote>239</Quote>
</Project>
...
```

