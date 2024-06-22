import { Button, Layout, Spin, theme, Descriptions } from "antd";
const { Content } = Layout;
import { InboxOutlined } from "@ant-design/icons";
import { message, Upload } from "antd";
import { useState } from "react";
import pako from "pako";
import LZMA from "lzma-web";
const lzma = new LZMA();
import Headers from "../Headers";
const { Dragger } = Upload;

const Compression = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [uploadedFile, setUploadedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [compressionResults, setCompressionResults] = useState([]);
  const [originalFile, setOriginalFile] = useState([]);

  const props = {
    name: "file",
    fileList: null,
    maxCount: 1,
    action: null,
    beforeUpload: (file) => {
      setUploadedFile(file);
      setOriginalFile([
        {
          key: 1,
          label: "Nama",
          children: file.name,
        },
        {
          key: 2,
          label: "Ukuran",
          children: `${file.size} bytes`,
          size: file.size,
        },
        {
          key: 3,
          label: "Tipe/Ekstensi",
          children: file.type,
        },
      ]);

      return Upload.LIST_IGNORE;
    },
  };

  const handleCompress = async () => {
    try {
      setIsLoading(true);
      const fileData = new Uint8Array(await uploadedFile.arrayBuffer());

      // Deflate Compression
      const deflateStartTime = performance.now();
      const deflateCompressedData = pako.deflate(fileData);
      const deflateEndTime = performance.now();

      // LZMA Compression
      const lzmaStartTime = performance.now();
      const lzmaCompressedData = await lzma.compress(fileData);
      const lzmaEndTime = performance.now();

      const originalFileSize = originalFile[1].size;
      setCompressionResults([
        {
          method: "Deflate",
          compressedSize: deflateCompressedData.length,
          reduksiData: originalFileSize - deflateCompressedData.length,
          percentChange: (originalFileSize - deflateCompressedData.length) / originalFileSize,
          timeTaken: deflateEndTime - deflateStartTime,
        },
        {
          method: "LZMA",
          compressedSize: lzmaCompressedData.length,
          reduksiData: originalFileSize - lzmaCompressedData.length,
          percentChange: (originalFileSize - lzmaCompressedData.length) / originalFileSize,
          timeTaken: lzmaEndTime - lzmaStartTime,
        },
      ]);
    } catch (error) {
      console.error("Error compressing audio", error);
      message.error("Error compressing audio", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setCompressionResults([]);
  };
  const clearResults = () => {
    setCompressionResults([]);
  };

  return (
    <Layout>
      <Headers />
      <Content style={{ background: colorBgContainer }}>
        <div
          style={{
            minHeight: 280,
            borderRadius: borderRadiusLG,
          }}
        >
          <h1 style={{ margin: "30px 50px" }}>Perbandingan Algoritma Kompresi Lossless (Deflate dan LZMA)</h1>
          <div
            style={{
              width: "60%",
              display: "flex",
              marginLeft: 100,
            }}
          >
            {isLoading ? (
              <Spin tip="Compressing"></Spin>
            ) : (
              <div>
                {uploadedFile === null ? (
                  <Dragger {...props}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Klik atau seret file untuk mulai mengunggah!!</p>
                  </Dragger>
                ) : (
                  <div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <Descriptions title=" File Unggahan" items={originalFile} />
                      <Button type="primary" danger size="large" onClick={clearFile}>
                        Hapus File
                      </Button>
                    </div>
                    {compressionResults.length == 0 ? (
                      <Button type="primary" size="large" onClick={handleCompress} style={{ marginTop: 40 }}>
                        Mulai Kompresi
                      </Button>
                    ) : (
                      <div style={{ marginTop: 50 }}>
                        <h2>Hasil Kompresi:</h2>
                        <div>
                          {compressionResults.map((result, index) => (
                            <Descriptions title={result.method} key={index} style={{ margin: "20px 0px 0px" }}>
                              <Descriptions.Item label="Ukuran File">{result.compressedSize} bytes</Descriptions.Item>
                              <Descriptions.Item label="Data yang Dikurangi">{result.reduksiData} bytes</Descriptions.Item>
                              <Descriptions.Item label="Persentase Kompresi">{result.percentChange.toFixed(3) * 100} %</Descriptions.Item>
                              <Descriptions.Item label="Waktu yang Dibutuhkan">{result.timeTaken.toFixed(2)} ms</Descriptions.Item>
                            </Descriptions>
                          ))}
                        </div>

                        <Button type="primary" danger onClick={clearResults}>
                          Hapus Hasil Kompresi
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default Compression;
