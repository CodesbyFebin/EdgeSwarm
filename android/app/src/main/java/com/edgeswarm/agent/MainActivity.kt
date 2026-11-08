package com.edgeswarm.agent

import android.app.Activity
import android.os.Bundle
import android.graphics.Color
import android.widget.*
import org.json.JSONObject
import java.util.UUID

class MainActivity : Activity() {
    private lateinit var log: TextView
    private lateinit var input: EditText
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = Color.rgb(5,11,23)
        window.navigationBarColor = Color.rgb(5,11,23)
        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(36,60,36,32)
            setBackgroundColor(Color.rgb(5,11,23))
        }
        fun label(text:String,size:Float,color:Int):TextView = TextView(this).apply {
            this.text=text; textSize=size; setTextColor(color); setPadding(0,8,0,14)
        }
        container.addView(label("⬡ EdgeSwarm",30f,Color.rgb(19,221,242)))
        container.addView(label("ANDROID EDGEAGENT · LOCAL PROTOTYPE",12f,Color.rgb(0,232,138)))
        container.addView(label("Execute → Sign → Export Evidence",20f,Color.WHITE))
        container.addView(label("This app executes a bounded uppercase task locally. It does not connect to Solana or receive paid jobs.",13f,Color.LTGRAY))
        input=EditText(this).apply { setSingleLine(false); setText("hello edgeswarm"); hint="Task input"; setTextColor(Color.WHITE); setHintTextColor(Color.LTGRAY) }
        container.addView(input)
        container.addView(Button(this).apply { text="Execute and sign local task"; setOnClickListener { execute() } })
        log=label("Ready. Evidence appears here.",12f,Color.rgb(205,221,237)).apply { setTextIsSelectable(true) }
        container.addView(ScrollView(this).apply { addView(log) },LinearLayout.LayoutParams(-1,0,1f))
        setContentView(container)
    }
    private fun execute(){
        try{
            val text=input.text.toString()
            require(text.isNotEmpty() && text.length<=10000){"Input must be 1–10000 characters"}
            val output=text.uppercase(java.util.Locale.ROOT)
            val evidence=JSONObject().apply {
                put("version","edgeswarm-android-local-v1")
                put("jobId",UUID.randomUUID().toString())
                put("taskType","uppercase")
                put("taskHash",AgentCrypto.sha256(text))
                put("resultHash",AgentCrypto.sha256(output))
                put("publicKeySpkiBase64",AgentCrypto.publicKeyBase64())
                put("signatureAlgorithm","SHA256withECDSA_P256")
                put("mode","LOCAL_DEMO")
            }
            val signedBytes=("EDGESWARM_ANDROID_LOCAL_V1\n"+evidence.getString("jobId")+"\n"+
                evidence.getString("taskHash")+"\n"+evidence.getString("resultHash")).toByteArray(Charsets.UTF_8)
            evidence.put("signatureBase64",AgentCrypto.sign(signedBytes))
            evidence.put("output",output)
            log.text=evidence.toString(2)
        }catch(e:Exception){log.text="Error: ${e.message}"}
    }
}
