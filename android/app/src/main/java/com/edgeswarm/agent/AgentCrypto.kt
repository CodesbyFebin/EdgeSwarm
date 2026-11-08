package com.edgeswarm.agent

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.MessageDigest
import java.security.Signature
import java.util.Base64

object AgentCrypto {
    private const val ALIAS = "edgeswarm.worker.p256.v1"
    fun keyPair(): KeyPair {
        val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        val existing = store.getCertificate(ALIAS)?.publicKey
        if (existing != null) {
            val privateKey = store.getKey(ALIAS, null) as java.security.PrivateKey
            return KeyPair(existing, privateKey)
        }
        val generator = KeyPairGenerator.getInstance("EC", "AndroidKeyStore")
        generator.initialize(KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY)
            .setAlgorithmParameterSpec(java.security.spec.ECGenParameterSpec("secp256r1"))
            .setDigests(KeyProperties.DIGEST_SHA256).build())
        return generator.generateKeyPair()
    }
    fun sign(payload: ByteArray): String {
        val signature = Signature.getInstance("SHA256withECDSA")
        signature.initSign(keyPair().private)
        signature.update(payload)
        return Base64.getEncoder().encodeToString(signature.sign())
    }
    fun sha256(value: String): String = MessageDigest.getInstance("SHA-256").digest(value.toByteArray(Charsets.UTF_8)).joinToString("") { "%02x".format(it) }
    fun publicKeyBase64(): String = Base64.getEncoder().encodeToString(keyPair().public.encoded)
}
