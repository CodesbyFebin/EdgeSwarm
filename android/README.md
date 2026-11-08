# EdgeSwarm Android EdgeAgent — Kotlin Prototype

Native Android Kotlin app for bounded uppercase task execution, SHA-256 hashes, and Android Keystore P-256 ECDSA signed JSON evidence.

## Build

Open the `android/` directory in Android Studio with JDK 17 and Android SDK 35. Sync Gradle and run on an Android 8+ device/emulator. The repository does not include a Gradle wrapper JAR; use the Android Studio installed Gradle.

## Limitations

**Not an end-to-end verified network worker.** The Node.js local verifier uses Ed25519 while this Android app signs with ECDSA P-256, so the server does not currently accept its evidence. No job polling, network transport, backend registration, Solana wallet, Devnet settlement, background execution, or independently deployed ProofAgent. APK compilation and device testing have not been performed.

Signed UTF-8 payload: `EDGESWARM_ANDROID_LOCAL_V1\n<jobId>\n<taskHash>\n<resultHash>`. The output JSON is local evidence only, not a verified receipt.


## Fix after commit 401e7f9

- Android EdgeAgent now verifies its locally generated P-256 ECDSA evidence signature before it displays `locallyVerified: true`.
- Evidence can be shared with Android's chooser or copied as JSON.
- These checks confirm signature integrity **locally only**. The existing Node backend still uses Ed25519 and does not accept Android P-256 evidence.
- Android build/device execution has **not** been verified; use Android Studio with JDK 17 / SDK 35 to compile and test.
