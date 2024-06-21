import { Button, Layout, Spin, theme, Descriptions } from "antd";
const { Content } = Layout;
import { InboxOutlined, DeleteFilled } from "@ant-design/icons";
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
  const [originalFileSize, setOriginalFileSize] = useState(0);

  const props = {
    name: "file",
    fileList: null,
    maxCount: 1,
    action: null,
    beforeUpload: (file) => {
      setUploadedFile(file);
      setOriginalFileSize(file.size);
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

      setCompressionResults([
        {
          method: "Deflate",
          compressedSize: deflateCompressedData.length,
          percentChange: (originalFileSize - deflateCompressedData.length) / originalFileSize,
          timeTaken: deflateEndTime - deflateStartTime,
        },
        {
          method: "LZMA",
          compressedSize: lzmaCompressedData.length,
          percentChange: (originalFileSize - lzmaCompressedData.length) / originalFileSize,
          timeTaken: lzmaEndTime - lzmaStartTime,
        },
      ]);
    } catch (error) {
      console.error("Error compressing audio", error);
      message.error("Error compressing audio");
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
      <Content
        style={{
          padding: "0 0px",
        }}
      >
        <div
          style={{
            background: colorBgContainer,
            minHeight: 280,
            borderRadius: borderRadiusLG,
          }}
        >
          <h1 style={{ margin: 50 }}>Perbandingan Algoritma Kompresi Lossless (Deflate dan LZMA)</h1>
          <div
            style={{
              width: "60%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
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
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                  </Dragger>
                ) : (
                  <div style={{ marginTop: 16, display: "flex", alignItems: "center", flexDirection: "column", gap: 30 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
                      <p>
                        Original File Size: <strong>{originalFileSize}</strong> bytes
                      </p>
                      <Button type="primary" danger icon={<DeleteFilled />} onClick={clearFile} />
                    </div>
                    {compressionResults.length == 0 ? (
                      <Button type="primary" size="large" onClick={handleCompress}>
                        Compress
                      </Button>
                    ) : (
                      <div style={{ marginTop: 32, marginLeft: 100 }}>
                        <h2>Compression Results:</h2>
                        <div>
                          {compressionResults.map((result, index) => (
                            <Descriptions title={result.method} key={index}>
                              <Descriptions.Item label="Ukuran File">{result.compressedSize} bytes</Descriptions.Item>
                              <Descriptions.Item label="Persentase Perubahan">{result.percentChange.toFixed(3) * 100} %</Descriptions.Item>
                              <Descriptions.Item label="Waktu yang Dibutuhkan">{result.timeTaken.toFixed(2)} ms</Descriptions.Item>
                            </Descriptions>
                          ))}
                        </div>

                        <Button type="primary" danger onClick={clearResults}>
                          Clear Results
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
